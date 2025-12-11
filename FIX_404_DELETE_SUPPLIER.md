# ✅ Fixed: Lỗi 404 Khi Xóa Nhà Cung Cấp

## 🐛 **Vấn Đề:**
- Click xóa nhà cung cấp → Lỗi 404
- Browser redirect đến `localhost:3001/sign-in` (không tồn tại)
- Hiện trang: "404 - This page could not be found"

## 🔍 **Nguyên Nhân:**
1. Token JWT hết hạn (expire sau 15 phút)
2. Backend trả về **401 Unauthorized**
3. Axios interceptor redirect đến `/sign-in`
4. **Lỗi:** Frontend không có route `/sign-in`, chỉ có `/auth/login`
5. → Next.js 404!

## ✅ **Đã Fix:**

### File: `client/src/services/api-client.ts`
```typescript
// ❌ TRƯỚC (SAI):
if (error.response?.status === 401) {
  this.clearToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/sign-in' // ← Sai route!
  }
}

// ✅ SAU (ĐÚNG):
if (error.response?.status === 401) {
  this.clearToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login' // ← Đúng route!
  }
}
```

---

## 🎯 **Kết Quả:**
- ✅ Token hết hạn → Redirect đúng đến `/auth/login`
- ✅ Không còn lỗi 404
- ✅ User có thể đăng nhập lại và tiếp tục

---

## 🚀 **Cách Test:**

### 1. Refresh Browser
```
Ctrl + Shift + R
```

### 2. Đăng Nhập Lại
- Vào: http://localhost:3001/auth/login
- Username: `vvquan`
- Password: `123456`
- Click "Đăng nhập"

### 3. Test Xóa Nhà Cung Cấp
1. Vào menu "Nhà cung cấp"
2. Click nút Delete (icon thùng rác)
3. Xác nhận xóa
4. ✅ Xóa thành công!

### 4. Nếu Token Hết Hạn
- Sau 15 phút, token sẽ hết hạn
- Khi thao tác → Tự động redirect về `/auth/login`
- Đăng nhập lại → Tiếp tục làm việc

---

## 📝 **Lưu Ý:**

### Token Expiry Time
Backend config token hết hạn sau **15 phút:**
```typescript
// server/src/config/config.ts
jwt: {
  expiry: "15m"
}
```

**Có thể tăng lên:**
```typescript
jwt: {
  expiry: "1h" // 1 giờ
}
```

### Check Token Trong Console
```javascript
// Mở DevTools Console (F12)
localStorage.getItem('accessToken')

// Nếu null → chưa login
// Nếu có → copy và paste vào jwt.io để xem exp time
```

---

## 🎉 **Summary:**

| Before | After |
|--------|-------|
| ❌ 404 Error khi xóa | ✅ Xóa thành công |
| ❌ Redirect sai route `/sign-in` | ✅ Redirect đúng `/auth/login` |
| ❌ User confused | ✅ User có thể login lại |

---

## ✅ **File Đã Sửa:**
1. `client/src/services/api-client.ts` - Fixed redirect URL
2. `client/src/services/supplier.service.ts` - Added debug logs & 404 error handling

---

**🎯 Bây giờ bạn có thể xóa nhà cung cấp và loại sản phẩm bình thường rồi!**

Nếu vẫn gặp lỗi, hãy:
1. Check console logs (F12)
2. Check network tab để xem request/response
3. Đăng nhập lại nếu token hết hạn
