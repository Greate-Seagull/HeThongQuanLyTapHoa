# 🐛 Debug: Lỗi 404 Khi Xóa Nhà Cung Cấp

## ❌ Hiện Tượng
- Click xóa nhà cung cấp → Lỗi 404
- Browser hiện trang 404: "This page could not be found"
- URL: `localhost:3001/sign-in` (404)

## 🔍 Nguyên Nhân Có Thể

### 1. ❌ **Token Hết Hạn → Redirect 401 → /sign-in**
```typescript
// api-client.ts interceptor
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in
      window.location.href = '/sign-in' // ← 404 nếu route không tồn tại!
    }
  }
)
```

**Vấn đề:**
- Token JWT hết hạn hoặc không hợp lệ
- Backend trả về 401
- Interceptor redirect đến `/sign-in`
- Nhưng frontend dùng `/auth/login`, không có `/sign-in` → **404!**

---

## ✅ Giải Pháp

### Fix 1: Sửa Redirect URL trong api-client.ts

```typescript
// ❌ SAI:
window.location.href = '/sign-in'

// ✅ ĐÚNG:
window.location.href = '/auth/login'
```

### Fix 2: Kiểm Tra Token Expiry

Token JWT có thể đã hết hạn. Backend config:
```typescript
// server/src/config/config.ts
jwt: {
  secret: "...",
  expiry: "15m" // Token hết hạn sau 15 phút!
}
```

---

## 🔧 Các Bước Sửa Lỗi

### Bước 1: Sửa Redirect URL
File: `client/src/services/api-client.ts`

```typescript
// Add response interceptor for error handling
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      this.clearToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login' // ← FIX THIS!
      }
    }
    return Promise.reject(error)
  }
)
```

### Bước 2: Kiểm Tra Token
Mở DevTools Console và chạy:
```javascript
localStorage.getItem('accessToken')
```

Nếu có token, decode để xem exp:
```javascript
// Paste token vào jwt.io để xem expiry time
```

### Bước 3: Đăng Nhập Lại
1. Vào: http://localhost:3001/auth/login
2. Username: `vvquan`
3. Password: `123456`
4. Login → Vào dashboard

### Bước 4: Test Delete Ngay
- Vào menu "Nhà cung cấp"
- Click xóa một supplier
- Nếu vẫn 404, check console logs

---

## 🧪 Debug Steps

### 1. Check Console Logs
Mở DevTools Console (F12), xem:
```
Deleting supplier with ID: X URL: /suppliers/X
```

### 2. Check Network Tab
- Mở DevTools → Network
- Click xóa supplier
- Xem request:
  - URL: `http://localhost:3000/suppliers/X` ?
  - Method: DELETE ?
  - Status: 401 → redirect → 404 ?

### 3. Check Token
```javascript
// Console
localStorage.getItem('accessToken')
// Nếu null → chưa login
// Nếu có → kiểm tra expiry tại jwt.io
```

---

## 📊 Expected vs Actual

### ✅ Expected Flow:
1. Click Delete → Call API DELETE /suppliers/X
2. Backend check token → OK
3. Backend delete → Success
4. Frontend reload list → Updated

### ❌ Actual Flow (Bug):
1. Click Delete → Call API DELETE /suppliers/X
2. Backend check token → **401 Unauthorized** (token hết hạn)
3. Interceptor redirect → `/sign-in` 
4. Next.js không có route `/sign-in` → **404!**

---

## ✅ Quick Fix Command

Sửa file `api-client.ts`:

```typescript
// Line ~40
if (error.response?.status === 401) {
  this.clearToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login' // ← CHANGE THIS
  }
}
```

---

## 🎯 Root Causes Summary

1. ❌ **Redirect URL sai:** `/sign-in` không tồn tại, phải là `/auth/login`
2. ❌ **Token hết hạn:** JWT expire sau 15 phút, cần đăng nhập lại
3. ❌ **401 Error bị ẩn:** Interceptor redirect trước khi user thấy lỗi thực sự

---

## 🚀 Immediate Action

1. **Sửa file ngay:**
   - `client/src/services/api-client.ts` 
   - Line ~40: `/sign-in` → `/auth/login`

2. **Refresh browser**

3. **Đăng nhập lại:**
   - http://localhost:3001/auth/login
   - vvquan / 123456

4. **Test delete supplier**

---

## 📝 Prevention

Để tránh lỗi này trong tương lai:

### 1. Tăng Token Expiry
```typescript
// server/src/config/config.ts
jwt: {
  expiry: "1h" // Tăng từ 15m lên 1h
}
```

### 2. Thêm Token Refresh
Implement token refresh mechanism

### 3. Show Error Toast
Thay vì redirect ngay, show toast:
```typescript
if (error.response?.status === 401) {
  toast.error('Phiên đăng nhập đã hết hạn')
  setTimeout(() => {
    window.location.href = '/auth/login'
  }, 2000)
}
```

---

## ✅ After Fix

Sau khi sửa, test lại:
1. ✅ Login thành công
2. ✅ Vào "Nhà cung cấp"
3. ✅ Delete supplier → Success
4. ✅ Không còn 404

---

**Lỗi chính: `/sign-in` phải đổi thành `/auth/login` trong api-client.ts!**
