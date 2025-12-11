# 🐛 Known Backend Issues & Workarounds

## Critical Issue: Missing User/Employee Data in Auth Response

### Problem Description

Backend authentication endpoints only return `{ token: string }` without user/employee data:

```typescript
// Current Backend Response
POST /accounts/sign-in
POST /employee-accounts/sign-in
Response: { token: "eyJ..." }  // ❌ Missing user data!
```

### Impact

1. **Staff Dashboard**: Cannot determine employee position (SALES/RECEIVING/INVENTORY)
2. **Profile Pages**: Missing user ID, name, and other details
3. **Authorization**: Cannot check permissions based on position
4. **UI Personalization**: Cannot display user name in header

### Required Backend Changes

#### Option 1: Return Full User Data (Recommended)

```typescript
// Customer Sign In
POST /accounts/sign-in
Response: {
  token: string
  user: {
    id: number
    name: string
    phoneNumber: string
    point: number
  }
}

// Employee Sign In  
POST /employee-accounts/sign-in
Response: {
  token: string
  employee: {
    id: number
    name: string
    position: 'SALES' | 'RECEIVING' | 'INVENTORY' | 'ADMIN'
  }
}
```

#### Option 2: Add "Me" Endpoints

```typescript
// Get current user profile
GET /accounts/me
Authorization: Bearer {token}
Response: {
  id: number
  name: string
  phoneNumber: string
  point: number
}

// Get current employee profile
GET /employee-accounts/me
Authorization: Bearer {token}
Response: {
  id: number
  name: string
  position: string
  employee: {
    id: number
    name: string
    position: 'SALES' | 'RECEIVING' | 'INVENTORY' | 'ADMIN'
  }
}
```

### Current Frontend Workarounds

#### 1. Staff Dashboard (`client/src/app/dashboard/staff/page.tsx`)

```typescript
// ⚠️ WORKAROUND: Use mock employee data
const mockEmployeeData = user.employeeData || {
  id: 1,
  name: user.username || 'Nhân viên',
  position: 'SALES', // Default position
}
```

**Limitations**:
- All staff members default to SALES position
- Cannot restrict features based on actual position
- Profile page shows incomplete data

#### 2. Login Warning (`client/src/app/auth/login/page.tsx`)

```typescript
// Show warning toast for staff login
if (selectedRole === 'staff') {
  toast.warning('Đăng nhập thành công, nhưng thông tin nhân viên chưa đầy đủ')
}
```

#### 3. Menu Items (`client/src/app/dashboard/staff/page.tsx`)

```typescript
// Default to showing all menu items since position is unknown
const getMenuItems = () => {
  const position = user?.employeeData?.position || ''
  
  if (!position) {
    // Show all features when position is unknown
    return [
      { id: 'inventory', label: 'Phiếu kiểm kê' },
      { id: 'import', label: 'Phiếu nhập hàng' },
      { id: 'invoice', label: 'Hóa đơn' },
      { id: 'profile', label: 'Thông tin cá nhân' },
    ]
  }
  // ... position-based filtering
}
```

### Testing Impact

Cannot properly test:
- ❌ Position-based access control
- ❌ Employee-specific workflows
- ❌ Multi-user scenarios
- ❌ Profile updates

### Timeline

- **Short-term (Current)**: Use workarounds, show warnings
- **Mid-term**: Add `GET /accounts/me` and `GET /employee-accounts/me` endpoints
- **Long-term**: Modify sign-in responses to include full user data

### Backend Files to Modify

```
server/src/
├── application/
│   ├── sign-in.usecase.ts          # Add user data to response
│   └── use-employee-account.usecase.ts  # Add employee data to response
├── presentation/
│   └── controllers/
│       ├── account.controller.ts    # Return full response
│       └── employee-account.controller.ts  # Return full response
```

### Priority: 🔴 HIGH

This issue blocks proper implementation of:
1. Role-based access control (RBAC)
2. User experience personalization
3. Audit logging with user context
4. Multi-tenant features

---

**Related Issues**:
- See `API_INTEGRATION_LOG.md` Issue #1
- See `API_INTEGRATION_SUMMARY.md` Section 2.1

**Last Updated**: December 11, 2025
