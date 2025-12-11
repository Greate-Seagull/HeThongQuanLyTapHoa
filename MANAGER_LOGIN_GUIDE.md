# 🏪 Hướng Dẫn Test Đăng Nhập Manager

## ✅ Hoàn Thành

Đã tích hợp API đăng nhập chủ cửa hàng (MANAGER) vào frontend!

## 🚀 Cách Test

### 1. Backend & Frontend đã chạy:
- **Backend**: http://localhost:3000 ✅
- **Frontend**: http://localhost:3001 ✅

### 2. Mở trình duyệt và truy cập:
```
http://localhost:3001/auth/login
```

### 3. Đăng nhập với tài khoản MANAGER:

**Chọn vai trò**: **Chủ CH** (Owner)

**Thông tin đăng nhập:**
- Username: `vvquan`
- Password: `123456`

### 4. Sau khi đăng nhập thành công:
- Sẽ chuyển đến: `/dashboard/owner`
- Hiển thị menu quản lý:
  - ✅ Nhân viên
  - ✅ Khuyến mãi  
  - ✅ Sản phẩm
  - ✅ Vị trí
  - ✅ Khách hàng
  - ✅ Báo cáo
  - ✅ Thông tin cá nhân

## 📋 Tài Khoản Test Khác

### Nhân viên (Staff):
- **Sales**: `lvban` / `123456`
- **Receiving**: `ttnhap` / `123456`
- **Inventory**: `nvkiem` / `123456`

### Khách hàng (Customer):
- **Phone**: `0901234567` / `123456`
- **Phone**: `0912345678` / `123456`

## 🔧 Thay Đổi Đã Thực Hiện

### 1. File: `client/src/app/auth/login/page.tsx`

**Trước đây:**
```typescript
} else if (selectedRole === 'owner') {
  // ⚠️ CRITICAL: No owner endpoint exists yet
  response = await ownerSignIn({...})
}
```

**Bây giờ:**
```typescript
} else if (selectedRole === 'owner') {
  // Owner uses the same endpoint as employee (MANAGER position)
  response = await employeeSignIn({
    username: username,
    password: password,
  })
  
  // Check if the employee has MANAGER position
  if (response.employee?.position !== 'MANAGER') {
    toast.error('Chỉ chủ cửa hàng (MANAGER) mới có thể đăng nhập với vai trò này')
    return
  }
  
  userData = {
    username: username,
    role: 'owner' as UserRole,
    employeeData: response.employee,
  }
}
```

### 2. File: `client/src/app/dashboard/owner/page.tsx`

**Cập nhật ProfilePage để hiển thị thông tin từ employeeData:**
```typescript
<ProfilePage
  user={{
    id: user?.employeeData?.id || 1,
    name: user?.employeeData?.name || 'Chủ cửa hàng',
    username: user?.username || 'admin',
    loggedAt: new Date(),
  }}
  role="owner"
/>
```

## 🔐 API Response Format

Khi đăng nhập thành công, backend trả về:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": 50,
      "username": "vvquan",
      "name": "Võ Văn Quản",
      "position": "MANAGER"
    }
  }
}
```

## ✨ Tính Năng Bảo Mật

- ✅ Kiểm tra `position === 'MANAGER'` khi đăng nhập với vai trò Owner
- ✅ Hiển thị thông báo lỗi nếu không phải MANAGER
- ✅ Token JWT được lưu và gửi kèm mọi request
- ✅ Redirect đúng dashboard dựa trên role

## 🎯 Next Steps

1. Test đăng nhập trên trình duyệt
2. Kiểm tra các menu trong dashboard owner
3. Thử các tài khoản khác (staff, customer)
4. Test logout và login lại

---
**Lưu ý**: Backend server phải chạy trên port 3000 và đã seed data thành công!
