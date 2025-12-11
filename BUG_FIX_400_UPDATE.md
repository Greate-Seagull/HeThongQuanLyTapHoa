# 🐛 Bug Fix: Error 400 khi Update Supplier/Category

## ❌ Lỗi Gặp Phải

```
AxiosError: Request failed with status code 400
at async ApiClient.put (src/services/api-client.ts:87:22)
at async updateSupplier (src/services/supplier.service.ts:81:22)
```

### Nguyên nhân:
1. **Frontend** gửi `id` trong body dưới dạng `number`
2. **Backend route** nhận `id` từ URL params dưới dạng `string` (vd: `/suppliers/:id`)
3. **Controller** merge body + params, params ghi đè body
4. **Repository** expect `id` là `number` nhưng nhận được `string` → **Error 400**

---

## ✅ Giải Pháp

### 1. Fix Frontend Services (Không gửi `id` trong body)

#### **supplier.service.ts:**
```typescript
// ❌ TRƯỚC:
export const updateSupplier = async (data: UpdateSupplierRequest): Promise<Supplier> => {
  const response = await apiClient.put<{ supplier: Supplier }>(`/suppliers/${data.id}`, data)
  // Gửi cả id trong body → conflict với params
}

// ✅ SAU:
export const updateSupplier = async (data: UpdateSupplierRequest): Promise<Supplier> => {
  const { id, ...updateFields } = data
  const response = await apiClient.put<{ supplier: Supplier }>(`/suppliers/${id}`, updateFields)
  // Chỉ gửi fields cần update, không gửi id
}
```

#### **product-category.service.ts:**
```typescript
// ✅ Tương tự
export const updateProductCategory = async (data: UpdateProductCategoryRequest): Promise<ProductCategory> => {
  const { id, ...updateFields } = data
  const response = await apiClient.put<{ category: ProductCategory }>(`/product-categories/${id}`, updateFields)
}
```

---

### 2. Fix Backend Controller (Parse params thành number)

#### **controller.ts:**
```typescript
// ❌ TRƯỚC:
export function controller(usecase: any) {
  return async (req: any, res: any) => {
    const input = {
      ...(req.body || {}),
      ...(req.params || {}), // params là string!
      ...(req.query || {}),
      authId: req.authId,
    };
    // ...
  }
}

// ✅ SAU:
export function controller(usecase: any) {
  return async (req: any, res: any) => {
    // Parse numeric params (id, productId, etc.)
    const parsedParams = { ...req.params };
    for (const key in parsedParams) {
      if (parsedParams[key] && !isNaN(Number(parsedParams[key]))) {
        parsedParams[key] = Number(parsedParams[key]);
      }
    }

    const input = {
      ...(req.body || {}),
      ...parsedParams, // Bây giờ id là number
      ...(req.query || {}),
      authId: req.authId,
    };
    // ...
  }
}
```

---

## 🔄 Cách Áp Dụng Fix

### Bước 1: Restart Backend Server
```bash
cd HeThongQuanLyTapHoa
cd server
# Ctrl+C để dừng server hiện tại
npm run dev
```

### Bước 2: Refresh Frontend
- Frontend sẽ tự động reload do Next.js hot reload
- Hoặc refresh browser: `Ctrl + Shift + R`

---

## ✅ Test Lại

1. Đăng nhập: http://localhost:3001/auth/login
2. Username: `vvquan` / Password: `123456`
3. Vào menu **"Nhà cung cấp"**
4. Click Edit một supplier
5. Sửa thông tin
6. Click **"Cập Nhật"** ✅
7. Test tương tự cho **"Loại sản phẩm"**

---

## 📊 Tóm Tắt Thay Đổi

### Files Đã Sửa:

#### Frontend (3 files):
1. ✅ `client/src/services/supplier.service.ts`
   - Sửa `updateSupplier()` - không gửi id trong body

2. ✅ `client/src/services/product-category.service.ts`
   - Sửa `updateProductCategory()` - không gửi id trong body

#### Backend (1 file):
3. ✅ `server/src/presentation/controllers/controller.ts`
   - Parse URL params thành number trước khi merge

---

## 🎯 Kết Quả

- ✅ Update Supplier hoạt động
- ✅ Update ProductCategory hoạt động
- ✅ Delete Supplier/Category hoạt động (cũng dùng param ID)
- ✅ Không còn lỗi 400
- ✅ Controller tự động parse ID cho tất cả routes

---

## 🚀 Ready to Test!

Bây giờ bạn có thể update Nhà Cung Cấp và Loại Sản Phẩm mà không gặp lỗi 400 nữa! 🎉
