import { apiClient } from './api-client'
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest 
} from '@/types'

// ======================
// PRODUCT SERVICE API CALLS
// ======================

/**
 * Get All Products
 * GET /products
 * Authorization: Requires ADMIN role
 * 
 * ⚠️ AUTHORIZATION ISSUE: Backend requires ADMIN role
 * Frontend has positions: SALES, INVENTORY, RECEIVING
 * Question: Should INVENTORY staff have access? (They need product management)
 */
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('📤 Fetching products...');
    // ✅ Backend returns { products: Product[] }
    const response = await apiClient.get<{ products: Product[] }>('/products');
    console.log('📥 Products response:', response);
    
    // ✅ Extract products array
    const products = response.products || [];
    
    console.log(`✅ Received ${products.length} products`);
    
    // Log sample
    if (products.length > 0) {
      const sample = products[0];
      console.log('📦 Sample product:', {
        id: sample.id,
        name: sample.name,
        barcode: sample.barcode,
        slotDetailsCount: sample.slotDetails?.length || 0,
      });
    }
    
    return products;
  } catch (error: any) {
    console.error('Get products error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'
    );
  }
}

/**
 * Search Product by ID
 * GET /products/:productId
 * Authorization: Requires ADMIN role
 * 
 * ⚠️ SAME AUTHORIZATION ISSUE as getProducts
 */
export const searchProduct = async (productId: number): Promise<Product> => {
  try {
    const response = await apiClient.get<Product>(`/products/${productId}`)
    return response
  } catch (error: any) {
    console.error('Search product error:', error)
    
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy sản phẩm.')
    }
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền xem thông tin sản phẩm.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.'
    )
  }
}

/**
 * Update Products (Bulk Update)
 * PUT /products/bulk
 * Authorization: Requires ADMIN role
 * 
 * ⚠️ MISSING API DOCUMENTATION: 
 * - What is the expected request body format?
 * - Is it array of products to update?
 * - Or individual fields to update?
 * 
 * Assumed format based on common patterns:
 * Body: Product[] (array of products with updated fields)
 */
export const updateProducts = async (
  products: UpdateProductRequest[]
): Promise<Product[]> => {
  try {
    const response = await apiClient.put<Product[]>('/products/bulk', products)
    return response
  } catch (error: any) {
    console.error('Update products error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền cập nhật sản phẩm.')
    }
    
    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || 
        'Dữ liệu cập nhật không hợp lệ.'
      )
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể cập nhật sản phẩm. Vui lòng thử lại.'
    )
  }
}

/**
 * ⚠️ MISSING ENDPOINTS (Commonly needed for product management):
 * 
 * 1. POST /products - Create new product
 * 2. PUT /products/:id - Update single product
 * 3. DELETE /products/:id - Delete product
 * 4. GET /products?search=... - Search products by name/barcode
 * 5. GET /products?status=GOOD - Filter by status
 * 
 * These are typically needed for a complete product management system
 */

/**
 * Create Product (NOT IMPLEMENTED - Endpoint doesn't exist)
 * Expected: POST /products
 */
export const createProduct = async (
  product: CreateProductRequest
): Promise<Product> => {
  throw new Error(
    'Chức năng tạo sản phẩm chưa được backend hỗ trợ. ' +
    'Cần endpoint: POST /products'
  )
}

/**
 * Update Single Product (NOT IMPLEMENTED - Endpoint doesn't exist)
 * Expected: PUT /products/:id
 */
export const updateProduct = async (
  productId: number,
  updates: UpdateProductRequest
): Promise<Product> => {
  throw new Error(
    'Chức năng cập nhật từng sản phẩm chưa được backend hỗ trợ. ' +
    'Cần endpoint: PUT /products/:id'
  )
}

/**
 * Delete Product (NOT IMPLEMENTED - Endpoint doesn't exist)
 * Expected: DELETE /products/:id
 */
export const deleteProduct = async (productId: number): Promise<void> => {
  throw new Error(
    'Chức năng xóa sản phẩm chưa được backend hỗ trợ. ' +
    'Cần endpoint: DELETE /products/:id'
  )
}
