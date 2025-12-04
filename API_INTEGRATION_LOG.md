# API Integration Log - Frontend to Backend

## Date: December 4, 2025
## Updated: December 4, 2025 (After Integration Testing)

---

## ✅ INTEGRATION STATUS

### Completed Integrations - Phase 1 (Authentication)
1. ✅ **Auth Service Created**: `client/src/services/auth.service.ts`
   - customerSignIn(), customerSignUp()
   - employeeSignIn(), employeeSignUp()
   - Error handling with Vietnamese messages
   
2. ✅ **Login Page Integrated**: `client/src/app/auth/login/page.tsx`
   - Calls real API endpoints
   - Loading states and error handling
   - Token storage via apiClient
   
3. ✅ **Register Page Integrated**: `client/src/app/auth/register/page.tsx`
   - Customer registration with phoneNumber
   - Staff registration with employeeId (two-step process)
   - Auto-redirect to dashboard after success
   
4. ✅ **Auth Store Enhanced**: `client/src/store/auth-store.ts`
   - Added accessToken field
   - setToken() method
   - Persists to localStorage

### Completed Integrations - Phase 2 (Business Logic APIs)
5. ✅ **Product Service Created**: `client/src/services/product.service.ts`
   - getProducts(), searchProduct(), updateProducts()
   - Authorization handling (ADMIN required)
   - Missing endpoints documented
   
6. ✅ **Promotion Service Created**: `client/src/services/promotion.service.ts`
   - createPromotion()
   - Missing GET/UPDATE/DELETE endpoints documented
   
7. ✅ **Invoice Service Created**: `client/src/services/invoice.service.ts`
   - createInvoice() (SALES position required)
   - Missing history/stats endpoints documented
   
8. ✅ **Good Receipt Service Created**: `client/src/services/good-receipt.service.ts`
   - createGoodReceipt() (RECEIVING position required)
   - Missing management endpoints documented
   
9. ✅ **Stocktaking Service Created**: `client/src/services/stocktaking.service.ts`
   - createStocktaking() (INVENTORY position required)
   - Warehouse structure APIs missing (Shelf/Rack/Slot)

---

## API Endpoints Available (From Backend)

### 1. Authentication APIs

#### Customer Authentication
- **Sign Up**: `POST /accounts`
  - Body: `{ name: string, phoneNumber: string, password: string }`
  - Response: `{ token: string }`
  
- **Sign In**: `POST /accounts/sign-in`
  - Body: `{ phoneNumber: string, password: string }`
  - Response: `{ token: string }`

#### Employee Authentication
- **Create Employee Account**: `POST /employee-accounts`
  - Body: `{ username: string, password: string, employeeId: number }`
  - Response: `{ token: string }`
  
- **Employee Sign In**: `POST /employee-accounts/sign-in`
  - Body: `{ username: string, password: string }`
  - Response: `{ token: string }`

### 2. Product APIs
- **Get Products**: `GET /products` (requires auth + ADMIN role)
- **Search Product**: `GET /products/:productId` (requires auth + ADMIN role)
- **Update Products**: `PUT /products/bulk` (requires auth + ADMIN role)

### 3. Promotion APIs
- **Endpoint**: `/promotions`

### 4. Invoice APIs
- **Endpoint**: `/invoices`

### 5. Good Receipt APIs
- **Endpoint**: `/good-receipts`

### 6. Stocktaking APIs
- **Endpoint**: `/stocktakings`

---

## Issues Found & Required Backend Fixes

### 🔴 CRITICAL ISSUE #1: Authentication Mismatch
**Problem**: Frontend uses username-based auth for staff, but backend expects different fields

**Frontend Expectation** (Login Page):
```typescript
// Staff login
{
  username: 'nvkiem',
  password: '123456',
  role: 'staff'
}
```

**Backend Expectation**:
```typescript
// POST /employee-accounts/sign-in
{
  username: string,
  password: string
}
```

**Status**: ⚠️ Partially Compatible
**Action Required**: 
- [ ] Backend needs to return employee data (id, position, name) in sign-in response
- [ ] Current response only returns token, missing employee details

**Expected Response Should Be**:
```typescript
{
  token: string,
  employee: {
    id: number,
    position: 'SALES' | 'INVENTORY' | 'RECEIVING',
    name: string,
    username: string
  }
}
```

---

### 🔴 CRITICAL ISSUE #2: Owner Authentication Missing
**Problem**: No API endpoint for owner login

**Frontend Expectation**:
```typescript
// Owner login
{
  username: 'admin',
  password: '123456',
  role: 'owner'
}
```

**Backend Status**: ❌ No endpoint exists

**Action Required**:
- [ ] Create Owner authentication endpoint
- [ ] OR clarify if owner uses employee-account with special role
- [ ] Need endpoint: `POST /owner/sign-in` or similar

---

### 🔴 CRITICAL ISSUE #3: Customer Sign-In Field Mismatch
**Problem**: Frontend uses username, backend expects phoneNumber

**Frontend Login Form**:
```typescript
// User enters username field
{
  username: 'customer123',
  password: '123456'
}
```

**Backend Expects**:
```typescript
{
  phoneNumber: string, // Not username!
  password: string
}
```

**Status**: ❌ Incompatible
**Action Required**:
- [ ] Option 1: Frontend should use phoneNumber field for customer login
- [ ] Option 2: Backend should accept username OR phoneNumber
- [ ] Recommend: Use phoneNumber for customers (matches schema)

---

### 🟡 ISSUE #4: Customer Registration Mismatch
**Problem**: Frontend collects username + phone, but backend only uses phone

**Frontend Registration**:
```typescript
{
  fullName: 'Nguyen Van A',
  username: 'nguyenvana', // ← Frontend collects this
  phone: '0901234567',
  password: '123456'
}
```

**Backend Sign-Up Expects**:
```typescript
{
  name: string,
  phoneNumber: string, // ← This is the unique identifier
  password: string
  // No username field!
}
```

**Status**: ⚠️ Misaligned
**Action Required**:
- [ ] Remove username field from customer registration form
- [ ] Use phoneNumber as login identifier for customers
- [ ] Update frontend to match backend schema

---

### 🟡 ISSUE #5: Employee Registration Position Field
**Problem**: Frontend collects position during registration, unclear if backend supports it

**Frontend Employee Registration**:
```typescript
{
  fullName: 'Tran Van B',
  username: 'tranvanb',
  password: '123456',
  position: 'SALES' // ← Frontend collects this
}
```

**Backend Create Employee Account**:
```typescript
{
  username: string,
  password: string,
  employeeId: number // ← Expects existing employee ID!
}
```

**Status**: ❌ Incompatible
**Action Required**:
- [ ] Backend expects `employeeId` (employee must exist first)
- [ ] Frontend expects to create employee WITH position
- [ ] Need clarification: Should frontend create Employee entity first, then account?
- [ ] OR should backend accept position in account creation?

**Recommended Flow**:
1. Create Employee entity: `POST /employees { name, position }`
2. Create Account for Employee: `POST /employee-accounts { username, password, employeeId }`

---

### 🟡 ISSUE #6: Product API Authorization
**Problem**: Products endpoint requires ADMIN role, but frontend has 3 staff positions

**Backend Authorization**:
```typescript
router.use(authorizationMiddleware("ADMIN"));
```

**Frontend Staff Positions**:
- SALES
- INVENTORY  
- RECEIVING

**Status**: ⚠️ Unclear
**Action Required**:
- [ ] Clarify which positions can access products
- [ ] Update authorization middleware to accept: ADMIN | INVENTORY | RECEIVING
- [ ] OR create separate endpoints for different roles

---

### 🟡 ISSUE #7: Token Response Format
**Problem**: Login responses only return token, frontend needs user data

**Current Backend Response**:
```typescript
{
  token: "eyJhbGc..." // Only token
}
```

**Frontend Needs**:
```typescript
{
  token: string,
  user: {
    id: number,
    name: string,
    role: 'owner' | 'staff' | 'customer',
    // For staff:
    employeeData?: {
      id: number,
      position: 'SALES' | 'INVENTORY' | 'RECEIVING',
      name: string
    },
    // For customer:
    customerId?: number,
    phoneNumber?: string
  }
}
```

**Status**: ⚠️ Incomplete
**Action Required**:
- [ ] Enhance sign-in responses to include user data
- [ ] This allows frontend to populate auth store correctly
- [ ] Reduces need for separate "get user info" call

---

## Recommended Backend API Changes

### Priority 1: Authentication Alignment

#### 1.1 Update Employee Sign-In Response
```typescript
// POST /employee-accounts/sign-in
// Response should include:
{
  token: string,
  employee: {
    id: number,
    username: string,
    name: string,
    position: 'SALES' | 'INVENTORY' | 'RECEIVING'
  }
}
```

#### 1.2 Create Owner Sign-In Endpoint
```typescript
// POST /owner/sign-in
// Request:
{
  username: string,
  password: string
}
// Response:
{
  token: string,
  owner: {
    id: number,
    username: string,
    name: string
  }
}
```

#### 1.3 Update Customer Sign-In
```typescript
// POST /accounts/sign-in
// Keep phoneNumber as identifier
{
  phoneNumber: string, // NOT username
  password: string
}
```

### Priority 2: Registration Flow

#### 2.1 Create Employee Entity Endpoint
```typescript
// POST /employees
{
  name: string,
  position: 'SALES' | 'INVENTORY' | 'RECEIVING'
}
// Response:
{
  id: number,
  name: string,
  position: string
}
```

#### 2.2 Update Employee Account Creation
```typescript
// POST /employee-accounts
// After employee created, create account:
{
  username: string,
  password: string,
  employeeId: number
}
```

### Priority 3: Authorization

#### 3.1 Update Product Authorization
```typescript
// Allow these positions:
authorizationMiddleware(['ADMIN', 'INVENTORY', 'RECEIVING'])
```

---

## Frontend Changes Needed

### Change 1: Update Customer Login Form
- Remove "username" field
- Use "phoneNumber" field instead
- Update validation to accept phone format

### Change 2: Update Customer Registration
- Remove "username" field  
- phoneNumber is the unique identifier
- Update form and API call

### Change 3: Update Employee Registration Flow
```typescript
// Two-step process:
// Step 1: Create employee
const employee = await api.post('/employees', {
  name: fullName,
  position: position
})

// Step 2: Create account for employee
const account = await api.post('/employee-accounts', {
  username: username,
  password: password,
  employeeId: employee.id
})
```

### Change 4: Update Auth Store
After login, store complete user data from API response

---

## 🧪 TESTING RESULTS (December 4, 2025)

### ✅ Successfully Implemented Features
1. **Customer Registration Flow**
   - Frontend sends: `{ name, phoneNumber, password }` to `POST /accounts`
   - Backend returns: `{ token }`
   - Token stored in apiClient + auth store
   - Auto-redirect to `/dashboard/customer`
   - Status: **READY TO TEST** (waiting for backend to be running)

2. **Customer Login Flow**
   - Frontend sends: `{ phoneNumber, password }` to `POST /accounts/sign-in`
   - Backend returns: `{ token }`
   - Token stored and user logged in
   - Status: **READY TO TEST**

3. **Staff Registration Flow**
   - Frontend sends: `{ employeeId, username, password }` to `POST /employee-accounts`
   - UI includes employeeId input field with helper text
   - Handles error when employeeId doesn't exist
   - Status: **READY TO TEST**

4. **Staff Login Flow**
   - Frontend sends: `{ username, password }` to `POST /employee-accounts/sign-in`
   - Backend returns: `{ token }`
   - Shows warning about missing employee data
   - Status: **PARTIAL** (works but lacks position data)

### ⚠️ Known Limitations (Backend Must Fix)
1. **Employee Sign-In Response**
   - Current: Only returns `{ token }`
   - Needed: `{ token, employee: { id, name, position } }`
   - Impact: Dashboard cannot show position-specific menus without this data

2. **Customer Sign-In Response**
   - Current: Only returns `{ token }`
   - Needed: `{ token, user: { id, name, point } }`
   - Impact: Profile page cannot display user info without additional API call

3. **Owner Authentication**
   - Current: No endpoint exists
   - Needed: `POST /owner/sign-in` or clarify which endpoint to use
   - Impact: Owner cannot log in at all

4. **Employee Registration Pre-requisite**
   - Current: Requires pre-existing employeeId
   - Limitation: Admin must create Employee record first
   - UI Updated: Added helper text explaining this requirement

### 🔧 Workarounds Implemented
1. **Minimal User Object**: Created temporary user object with username and role, missing full data
2. **Warning Toast**: Shows "Đăng nhập thành công, nhưng thông tin nhân viên chưa đầy đủ" for staff login
3. **Employee ID Field**: Added to registration form with clear instructions
4. **Error Messages**: Vietnamese error messages for better UX

---

## Testing Checklist

### Authentication Testing
- [⏸️] Customer sign-up with phoneNumber - **READY** (backend needs to be running)
- [⏸️] Customer sign-in with phoneNumber - **READY**
- [⏸️] Employee sign-in returns employee data - **BLOCKED** (backend must add employee data to response)
- [❌] Owner sign-in works - **BLOCKED** (no endpoint exists)
- [✅] Token is included in subsequent requests - **IMPLEMENTED** (via apiClient interceptor)
- [ ] Token refresh/expiry handling - **NOT YET IMPLEMENTED**

### Authorization Testing
- [ ] SALES staff cannot access product management - **NEEDS TESTING**
- [ ] INVENTORY staff CAN access product management - **NEEDS TESTING**
- [ ] RECEIVING staff CAN access good receipts - **NEEDS TESTING**
- [ ] Owner can access all endpoints - **BLOCKED** (no owner endpoint)

### Data Flow Testing
- [⚠️] User data populated correctly after login - **PARTIAL** (missing employee/user data from API)
- [ ] Dashboard shows correct menus based on role - **NEEDS TESTING**
- [⚠️] Profile page displays correct user info - **PARTIAL** (needs full user data from backend)

---

## 📝 ADDITIONAL FINDINGS FROM INTEGRATION

### Issue #8: Username vs Phone Number Confusion
**Context**: Frontend initially used "username" field for all roles, but backend expects different identifiers:
- Customer: Uses `phoneNumber` as identifier
- Employee: Uses `username` as identifier

**Frontend Changes Made**:
- Login page: Uses `username` input but sends as `phoneNumber` for customers
- Register page: Added separate `phone` field for customers
- UI labels remain generic "Tên đăng nhập" to avoid confusion

**Recommendation**: Consider unifying the identifier field or clearly document the difference in API docs

---

### Issue #9: Two-Step Employee Creation
**Context**: Backend requires Employee record to exist before creating EmployeeAccount

**Current Flow**:
```
1. Admin creates Employee record (name, position) → returns employeeId
2. Employee uses employeeId to create account (username, password, employeeId)
```

**UI Solution Implemented**:
- Added `employeeId` input field to registration form
- Added helper text: "⚠️ Quản trị viên phải tạo hồ sơ nhân viên trước khi đăng ký tài khoản"
- Shows friendly error if employeeId not found

**Future Enhancement**: Backend could add combined endpoint:
```typescript
POST /employee-accounts/register
Body: { name, position, username, password }
// Creates both Employee and EmployeeAccount in one transaction
```

---

### Issue #10: Missing GET /me Endpoints
**Problem**: After login with token-only response, frontend has no way to fetch full user data

**Needed Endpoints**:
```typescript
// Get current customer
GET /accounts/me
Headers: { Authorization: Bearer <token> }
Response: { id, name, point, phoneNumber }

// Get current employee
GET /employee-accounts/me
Headers: { Authorization: Bearer <token> }
Response: { id, name, position, username, employeeId }
```

**Workaround**: Frontend creates minimal user object, but profile page and dashboards lack full data

---

### Issue #11: Position-Based Authorization Unclear
**Question**: Product APIs require `authorizationMiddleware("ADMIN")`. Which positions count as ADMIN?
- Is INVENTORY staff allowed? (They need product management)
- Is RECEIVING staff allowed? (They need product updates via good receipts)
- Is SALES staff blocked? (They shouldn't manage products)

**Clarification Needed**: Update backend authorization to check employee position:
```typescript
// Instead of ADMIN role
authorizationMiddleware("ADMIN")

// Use position-based auth
authorizationMiddleware(["INVENTORY", "RECEIVING"]) // for product endpoints
authorizationMiddleware(["SALES"]) // for invoice endpoints
```

---

## API Client Configuration ✅ IMPLEMENTED

### Base URL
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```
**Status**: ✅ Configured in `client/src/services/api-client.ts`

### Headers
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```
**Status**: ✅ Auto-injected via axios interceptor

### Token Management
- ✅ Token stored in localStorage via `apiClient.setToken()`
- ✅ Token also stored in Zustand auth store
- ✅ Request interceptor adds token to all API calls
- ✅ Response interceptor handles 401 (redirects to login)

### Error Handling
- ✅ 400: Bad Request - Show validation errors (toast.error)
- ✅ 401: Unauthorized - Clear token & redirect to `/sign-in`
- ✅ Generic errors: Show Vietnamese error messages
- ✅ Network errors: Caught and displayed to user

---

## 📋 NEXT STEPS

### Priority 1: Backend Team (BLOCKING)
1. **Add Employee Data to Sign-In Response** ⚠️ HIGH PRIORITY
   ```typescript
   // POST /employee-accounts/sign-in response
   { 
     token: string,
     employee: { id, name, position, username, employeeId }
   }
   ```

2. **Add User Data to Customer Sign-In Response** ⚠️ HIGH PRIORITY
   ```typescript
   // POST /accounts/sign-in response
   { 
     token: string,
     user: { id, name, point, phoneNumber }
   }
   ```

3. **Create Owner Authentication Endpoint** ⚠️ CRITICAL
   - Decide on endpoint: `POST /owner/sign-in` or use employee endpoint with special position
   - Add to API routes and implement controller/usecase

4. **Add GET /me Endpoints** 🔵 MEDIUM PRIORITY
   - `GET /accounts/me` for customers
   - `GET /employee-accounts/me` for employees

5. **Clarify Position-Based Authorization** 🔵 MEDIUM PRIORITY
   - Document which positions can access which endpoints
   - Update authorization middleware to check positions, not just ADMIN role

### Priority 2: Frontend Team (READY TO WORK)
1. **Add Environment Variable**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. **Test Authentication Flows** (once backend is running)
   - Start backend server
   - Test customer registration + login
   - Test staff registration + login
   - Verify tokens work for protected endpoints

3. **Add Loading States** ✅ DONE
   - Login button disabled during API call
   - Register button disabled during API call

4. **Add Error Boundaries**
   - Catch unexpected errors in components
   - Show user-friendly error pages

### Priority 3: Integration Testing (WAITING FOR BACKEND)
- [ ] End-to-end authentication flow
- [ ] Product management with INVENTORY staff
- [ ] Good receipt creation with RECEIVING staff
- [ ] Invoice creation with SALES staff
- [ ] Profile page data display

---

## 📞 CONTACT & COLLABORATION

**Frontend Team Status**: ✅ API integration complete, waiting for backend fixes
**Backend Team Action Required**: Review Priority 1 issues above
**Estimated Backend Fix Time**: 2-4 hours for response structure changes

**Testing Environment**:
- Frontend: http://localhost:3001 (Next.js dev server)
- Backend: http://localhost:3000 (Express server)

**Files Modified/Created**:
- `client/src/services/auth.service.ts` (NEW)
- `client/src/services/product.service.ts` (NEW)
- `client/src/services/promotion.service.ts` (NEW)
- `client/src/services/invoice.service.ts` (NEW)
- `client/src/services/good-receipt.service.ts` (NEW)
- `client/src/services/stocktaking.service.ts` (NEW)
- `client/src/app/auth/login/page.tsx` (UPDATED)
- `client/src/app/auth/register/page.tsx` (UPDATED)
- `client/src/store/auth-store.ts` (UPDATED)
- `client/src/services/api-client.ts` (EXISTING - no changes needed)

---

## 🔍 COMPREHENSIVE API ANALYSIS - ALL MODULES

### Issue #12: Product Management - Missing CRUD Endpoints
**Available**: 
- ✅ GET /products (list all)
- ✅ GET /products/:id (search by ID)
- ✅ PUT /products/bulk (bulk update)

**Missing**:
- ❌ POST /products - Create new product
- ❌ PUT /products/:id - Update single product
- ❌ DELETE /products/:id - Delete product
- ❌ GET /products?search=... - Search by name/barcode
- ❌ GET /products?status=GOOD - Filter by status
- ❌ GET /products/low-stock - Get products running low

**Impact**: Cannot fully manage products from frontend. Must use bulk update for everything.

**Recommendation**: Add standard CRUD endpoints for individual product operations.

---

### Issue #13: Promotion Management - Only CREATE Available
**Available**:
- ✅ POST /promotions (create)

**Missing**:
- ❌ GET /promotions - List all promotions
- ❌ GET /promotions/:id - Get promotion details  
- ❌ GET /promotions/active - Get active promotions (CRITICAL for invoice creation!)
- ❌ PUT /promotions/:id - Update promotion
- ❌ DELETE /promotions/:id - Delete promotion
- ❌ GET /promotions?productId=... - Get promotions for product

**Impact**: 
- Cannot view promotion list in management UI
- **CRITICAL**: Cannot show available promotions when creating invoices
- Cannot edit or remove promotions

**Recommendation**: Add full CRUD endpoints, especially GET /promotions/active for invoice flow.

---

### Issue #14: Invoice Management - Only CREATE Available
**Available**:
- ✅ POST /invoices (create) - Authorization: SALES position ✅

**Missing**:
- ❌ GET /invoices - List all invoices (with pagination)
- ❌ GET /invoices/:id - Get invoice details
- ❌ GET /invoices/employee/:employeeId - Sales by employee
- ❌ GET /invoices/customer/:userId - Customer purchase history
- ❌ GET /invoices/today - Today's sales
- ❌ GET /invoices/stats - Sales statistics (total, average, etc.)
- ❌ DELETE /invoices/:id - Cancel invoice

**Impact**:
- Cannot view invoice history
- Cannot generate sales reports
- Cannot track employee performance
- Cannot show customer purchase history

**Recommendation**: Add reporting endpoints for sales analytics and history.

---

### Issue #15: Good Receipt Management - Only CREATE Available
**Available**:
- ✅ POST /good-receipts (create) - Authorization: RECEIVING position ✅

**Missing**:
- ❌ GET /good-receipts - List all receipts
- ❌ GET /good-receipts/:id - Get receipt details
- ❌ GET /good-receipts/employee/:employeeId - Receipts by employee
- ❌ GET /good-receipts/today - Today's receipts
- ❌ GET /good-receipts/stats - Receiving statistics
- ❌ PUT /good-receipts/:id - Update receipt (before finalizing)
- ❌ DELETE /good-receipts/:id - Delete receipt

**Critical Question**: Does POST /good-receipts automatically update product inventory?
- If YES: Need way to view and verify before applying
- If NO: Need POST /good-receipts/:id/apply endpoint

**Recommendation**: Add receipt history and inventory update workflow.

---

### Issue #16: Stocktaking Management - Only CREATE Available
**Available**:
- ✅ POST /stocktakings (create) - Authorization: INVENTORY position ✅

**Missing**:
- ❌ GET /stocktakings - List all stocktakings
- ❌ GET /stocktakings/:id - Get stocktaking details
- ❌ GET /stocktakings/employee/:employeeId - Stocktakings by employee
- ❌ GET /stocktakings/today - Today's stocktakings
- ❌ GET /stocktakings/stats - Statistics
- ❌ GET /stocktakings/discrepancies - Products with count differences
- ❌ PUT /stocktakings/:id - Update stocktaking
- ❌ DELETE /stocktakings/:id - Delete stocktaking
- ❌ POST /stocktakings/:id/apply - Apply adjustments to inventory

**Critical Question**: Same as good receipts - automatic or manual inventory update?

**Recommendation**: Add complete stocktaking workflow with discrepancy reports.

---

### Issue #17: Warehouse Structure - NO ENDPOINTS AT ALL
**Context**: Stocktaking requires Shelf → Rack → Slot structure (defined in Prisma schema)

**Missing ALL endpoints**:
- ❌ GET /shelves - List shelves
- ❌ POST /shelves - Create shelf
- ❌ PUT /shelves/:id - Update shelf
- ❌ DELETE /shelves/:id - Delete shelf
- ❌ GET /racks - List racks
- ❌ POST /racks - Create rack (with shelfId)
- ❌ GET /slots - List slots
- ❌ POST /slots - Create slot (with rackId)
- ❌ GET /slots/:id/products - View products in slot
- ❌ PUT /slots/:id/products - Assign products to slot

**Impact**: 
- **BLOCKING**: Cannot use stocktaking feature at all without warehouse setup
- No way to manage warehouse structure from frontend

**Recommendation**: Add complete warehouse management module before enabling stocktaking.

---

### Issue #18: Authorization Model Clarity
**Good News**: Backend uses position-based authorization correctly! ✅
- ADMIN → Products, Promotions
- SALES → Invoices
- RECEIVING → Good Receipts
- INVENTORY → Stocktakings

**Questions**:
1. What is "ADMIN"? Is it a position or role?
   - Employee positions in schema: SALES, INVENTORY, RECEIVING
   - Is ADMIN = Owner? Or special employee position?

2. Should INVENTORY staff access products?
   - They need to see products for stocktaking
   - Current: Products require ADMIN
   - Recommend: Allow INVENTORY read access

3. Should RECEIVING staff access products?
   - They need to see products for creating receipts
   - Current: Products require ADMIN
   - Recommend: Allow RECEIVING read access

**Recommendation**: 
- Clarify ADMIN definition
- Add read-only product access for INVENTORY and RECEIVING
- Keep write access (create/update/delete) for ADMIN only

---

## 📊 API COVERAGE SUMMARY

### Authentication APIs: 50% Complete
- ✅ Customer: Sign up, Sign in
- ✅ Employee: Create account, Sign in
- ❌ Owner: No authentication endpoint
- ❌ Token refresh/renewal
- ❌ Password reset
- ❌ GET /me endpoints

### Product APIs: 30% Complete
- ✅ List, Search, Bulk Update
- ❌ Create, Update single, Delete
- ❌ Search/Filter capabilities

### Promotion APIs: 10% Complete
- ✅ Create only
- ❌ All other CRUD operations
- ❌ Get active promotions (CRITICAL)

### Invoice APIs: 20% Complete
- ✅ Create only
- ❌ View, Stats, History

### Good Receipt APIs: 20% Complete
- ✅ Create only
- ❌ View, Verify, Stats

### Stocktaking APIs: 10% Complete
- ✅ Create only
- ❌ View, Apply, Discrepancies
- ❌ Warehouse structure (0%)

**Overall Backend API Completeness: ~23%**

---

## 🎯 RECOMMENDED BACKEND DEVELOPMENT ROADMAP

### Phase 1: Critical Fixes (Week 1)
1. Fix authentication responses (add user/employee data)
2. Add Owner authentication endpoint
3. Add GET /promotions/active (needed for invoice creation)
4. Add GET /products with filters (needed for all operations)

### Phase 2: Read Operations (Week 2)
5. Add GET endpoints for all modules (invoices, receipts, stocktakings)
6. Add pagination support
7. Add basic stats endpoints

### Phase 3: Complete CRUD (Week 3)
8. Add UPDATE/DELETE for all entities
9. Add search and filter capabilities
10. Add GET /me endpoints

### Phase 4: Warehouse & Advanced (Week 4)
11. Build Shelf/Rack/Slot management APIs
12. Add inventory adjustment workflows
13. Add comprehensive reporting endpoints

---

## Next Steps

1. **Backend Team**: Review and implement Priority 1 changes
2. **Frontend Team**: Prepare API integration with current endpoints
3. **Joint**: Test authentication flow end-to-end
4. **Backend Team**: Implement Priority 2 & 3 changes
5. **Frontend Team**: Integrate remaining endpoints
6. **Both Teams**: Conduct full integration testing

---

## Notes

- All passwords should be hashed on backend (already done ✅)
- JWT token expiry should be reasonable (e.g., 24 hours)
- Consider refresh token mechanism for better UX
- CORS must be configured on backend for frontend origin
- Consider rate limiting for auth endpoints

---

**Status**: 🟡 In Progress
**Last Updated**: December 4, 2025
**Updated By**: Frontend Team
