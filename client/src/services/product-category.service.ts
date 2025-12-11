import { apiClient } from './api-client'

// ======================
// TYPE DEFINITIONS
// ======================

export interface ProductCategory {
  id: number
  name: string
  description?: string
  _count?: {
    products: number
  }
}

export interface CreateProductCategoryRequest {
  name: string
  description?: string
}

export interface UpdateProductCategoryRequest {
  id: number
  name?: string
  description?: string
}

// ======================
// PRODUCT CATEGORY SERVICE API CALLS
// ======================

/**
 * Get All Product Categories
 * GET /product-categories
 */
export const getProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const response = await apiClient.get<{ categories: ProductCategory[] }>('/product-categories')
    return response.categories || []
  } catch (error: any) {
    console.error('Get categories error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách loại sản phẩm. Vui lòng thử lại.'
    )
  }
}

/**
 * Create Product Category
 * POST /product-categories
 * Authorization: Requires MANAGER role
 */
export const createProductCategory = async (data: CreateProductCategoryRequest): Promise<ProductCategory> => {
  try {
    const response = await apiClient.post<{ category: ProductCategory }>('/product-categories', data)
    return response.category
  } catch (error: any) {
    console.error('Create category error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo loại sản phẩm. Chỉ quản lý mới được phép.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo loại sản phẩm. Vui lòng thử lại.'
    )
  }
}

/**
 * Update Product Category
 * PUT /product-categories/:id
 * Authorization: Requires MANAGER role
 */
export const updateProductCategory = async (data: UpdateProductCategoryRequest): Promise<ProductCategory> => {
  try {
    // Extract id from data, send only the fields to update in body
    const { id, ...updateFields } = data
    const response = await apiClient.put<{ category: ProductCategory }>(`/product-categories/${id}`, updateFields)
    return response.category
  } catch (error: any) {
    console.error('Update category error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền cập nhật loại sản phẩm.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể cập nhật loại sản phẩm. Vui lòng thử lại.'
    )
  }
}

/**
 * Delete Product Category
 * DELETE /product-categories/:id
 * Authorization: Requires MANAGER role
 */
export const deleteProductCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/product-categories/${id}`)
  } catch (error: any) {
    console.error('Delete category error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền xóa loại sản phẩm.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể xóa loại sản phẩm. Vui lòng thử lại.'
    )
  }
}
