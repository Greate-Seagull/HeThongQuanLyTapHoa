# 🐛 Bug: Xóa Nhà Cung Cấp → Tự Động Logout

## ❌ Vấn Đề
- Click xóa nhà cung cấp
- Tự động logout về màn hình đăng nhập
- Đăng nhập lại → **Nhà cung cấp vẫn chưa bị xóa!**

## 🔍 Phân Tích

### Flow Hiện Tại:
1. User click Delete
2. Frontend gửi: `DELETE /suppliers/:id` với Authorization header
3. Backend:
   - ✅ Authentication middleware → Parse token → OK
   - ❌ Authorization middleware → Check position → **FAIL!**
   - Backend trả về **403 Forbidden**
4. Frontend interceptor nhận 403 → Không redirect (chỉ 401 mới redirect)
5. Nhưng có gì đó trigger logout...

### Nguyên Nhân Có Thể:

#### 1. Authorization Middleware Sai Logic
```typescript
// server/.../authorization.middleware.ts
export function authorizationMiddleware(position: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    authorize(position, req.body.position); // ← Lấy từ body
  };
}

function authorize(position: string, clientPosition: any) {
  if (position !== clientPosition) throw Error(`Invalid position`);
  // ❌ Check: "MANAGER" === req.body.position
}
```

**Vấn đề:**
- Route yêu cầu: `authorizationMiddleware("MANAGER")`
- Middleware check: `req.body.position === "MANAGER"`
- Token có position: `{ id: 50, position: "MANAGER" }`
- Authentication middleware set: `req.body.position = "MANAGER"`

**Nhưng...**
- Nếu `req.body` là `undefined` hoặc `{}`
- Thì `req.body.position` là `undefined`
- → `"MANAGER" !== undefined` → **403 Forbidden!**

#### 2. DELETE Request Không Có Body
Express có thể không parse body cho DELETE request nếu:
- Content-Type không đúng
- Body rỗng
- Middleware `express.json()` chưa chạy trước

---

## ✅ Giải Pháp

### Option 1: Fix Authorization Middleware (Recommended)

Thay vì check `req.body.position`, lấy từ decoded token hoặc attach vào `req`:

```typescript
// server/src/presentation/middlewares/authentication.middleware.ts
export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const result = authenticate(req.headers.authorization);
    
    // Attach to req object, not body
    (req as any).authId = result.id;
    (req as any).position = result.position;
    
    // Also keep in body for backward compatibility
    req.body.authId = result.id;
    req.body.position = result.position;
    
    next();
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
}
```

```typescript
// server/src/presentation/middlewares/authorization.middleware.ts
export function authorizationMiddleware(requiredPosition: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userPosition = (req as any).position || req.body.position;
      
      if (!userPosition) {
        throw new Error('Position not found in request');
      }
      
      if (requiredPosition !== userPosition) {
        throw new Error(`Invalid position. Required: ${requiredPosition}, Got: ${userPosition}`);
      }
      
      next();
    } catch (e: any) {
      console.error('Authorization error:', e.message);
      res.status(403).json({ message: e.message });
    }
  };
}
```

### Option 2: Debug Token & Position

Thêm logs để xem:

```typescript
// authorization.middleware.ts
export function authorizationMiddleware(position: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Required position:', position);
      console.log('User position from body:', req.body.position);
      console.log('Full req.body:', req.body);
      console.log('Headers:', req.headers);
      
      authorize(position, req.body.position);
      next();
    } catch (e: any) {
      console.error('Authorization failed:', e.message);
      res.status(403).json({ message: e.message });
    }
  };
}
```

---

## 🔧 Immediate Fix

### 1. Sửa Authentication Middleware

File: `server/src/presentation/middlewares/authentication.middleware.ts`

```typescript
export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("Call authentication middleware");
    console.log("Authorization header:", req.headers.authorization);

    const result = authenticate(req.headers.authorization);
    
    // Attach to both req object and body
    (req as any).authId = result.id;
    (req as any).position = result.position;
    req.body = req.body || {}; // Ensure body exists
    req.body.authId = result.id;
    req.body.position = result.position;

    console.log("Authenticated user:", result);
    next();
  } catch (e: any) {
    console.error("Authentication error:", e.message);
    res.status(401).json({ message: e.message });
  }
}
```

### 2. Sửa Authorization Middleware

File: `server/src/presentation/middlewares/authorization.middleware.ts`

```typescript
export function authorizationMiddleware(requiredPosition: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Call authorization middleware");
      console.log("Required position:", requiredPosition);
      
      // Try to get position from multiple sources
      const userPosition = (req as any).position || req.body?.position;
      
      console.log("User position:", userPosition);
      
      if (!userPosition) {
        throw new Error('User position not found. Authentication may have failed.');
      }

      if (requiredPosition !== userPosition) {
        throw new Error(`Access denied. Required: ${requiredPosition}, Your position: ${userPosition}`);
      }

      console.log("Authorization successful");
      next();
    } catch (e: any) {
      console.error("Authorization error:", e.message);
      res.status(403).json({ message: e.message });
    }
  };
}
```

---

## 🧪 Test After Fix

### 1. Restart Server
```bash
cd server
# Ctrl+C to stop
npm run dev
```

### 2. Clear Browser & Login
```javascript
// Console (F12)
localStorage.clear()
```
- Refresh: http://localhost:3001/auth/login
- Login: vvquan / 123456

### 3. Test Delete
- Vào "Nhà cung cấp"
- Click Delete
- Check console logs:
  ```
  Call authentication middleware
  Authenticated user: { id: 50, position: "MANAGER" }
  Call authorization middleware
  Required position: MANAGER
  User position: MANAGER
  Authorization successful
  ```

### 4. Check Backend Logs
Terminal server sẽ show:
```
Call authentication middleware
Authorization header: Bearer eyJhbGc...
Authenticated user: { id: 50, position: 'MANAGER', ... }
Call authorization middleware
Required position: MANAGER
User position: MANAGER
Authorization successful
DELETE /suppliers/1
```

---

## 🎯 Expected Results

- ✅ Click Delete → Xóa thành công
- ✅ Không bị logout
- ✅ List nhà cung cấp reload → Item đã mất
- ✅ Console không có lỗi 403

---

## 📊 Debug Checklist

Nếu vẫn lỗi, check:

1. **Token có hợp lệ?**
   ```javascript
   // Console
   localStorage.getItem('accessToken')
   // Copy và decode tại jwt.io
   ```

2. **Position trong token đúng không?**
   - Decoded token phải có: `{ id: 50, position: "MANAGER" }`

3. **Backend logs?**
   - Server terminal có log authentication và authorization không?

4. **Network tab?**
   - Request có header Authorization không?
   - Response status là gì? 401? 403? 200?

5. **Frontend console?**
   - Có log "Deleting supplier..."?
   - Error message là gì?

---

## 🚀 Quick Fix Code

Copy paste vào files:

### authentication.middleware.ts
```typescript
import { Request, Response, NextFunction } from "express";
import { tokenService } from "../../composition-root";
import { authenticationTokenSchema } from "../../domain/services/encrypt.service";

export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = authenticate(req.headers.authorization);
    
    // Attach to req object for all request types
    (req as any).authId = result.id;
    (req as any).position = result.position;
    
    // Also keep in body for backward compatibility
    req.body = req.body || {};
    req.body.authId = result.id;
    req.body.position = result.position;

    next();
  } catch (e: any) {
    console.error("Authentication error:", e.message);
    res.status(401).json({ message: e.message });
  }
}

function authenticate(header: string | undefined) {
  if (!header) throw Error("Authorization token required");
  
  const splitted = header.split(" ");
  if (splitted[0] !== "Bearer") throw Error("Invalid authorization format");

  const decoded = tokenService.verifyJwt(splitted[1]);
  const result = authenticationTokenSchema.parse(decoded);

  return result;
}
```

### authorization.middleware.ts
```typescript
import { Request, Response, NextFunction } from "express";

export function authorizationMiddleware(requiredPosition: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get position from req object or body
      const userPosition = (req as any).position || req.body?.position;
      
      if (!userPosition) {
        throw new Error('User position not found in request');
      }

      if (requiredPosition !== userPosition) {
        throw new Error(`Access denied. Required: ${requiredPosition}`);
      }

      next();
    } catch (e: any) {
      console.error("Authorization error:", e.message);
      res.status(403).json({ message: e.message });
    }
  };
}
```

---

## ✅ Summary

**Root Cause:**
- DELETE request không có body → `req.body.position` undefined
- Authorization check fail → 403
- Frontend nghĩ là 401 → logout

**Fix:**
- Attach position vào `req` object, không chỉ `body`
- Authorization check cả `req.position` và `req.body.position`
- Ensure `req.body` tồn tại trước khi set properties

**Test:**
1. Restart server
2. Clear localStorage & login lại
3. Delete supplier → Success ✅
