import { apiClient } from './api-client'

// ======================
// TYPE DEFINITIONS
// ======================

export interface Supplier {
  id: number
  name: string
  address?: string
  phoneNumber?: string
  _count?: {
    products: number
  }
}

export interface CreateSupplierRequest {
  name: string
  address?: string
  phoneNumber?: string
}

export interface UpdateSupplierRequest {
  id: number
  name?: string
  address?: string
  phoneNumber?: string
}

// ======================
// SUPPLIER SERVICE API CALLS
// ======================

/**
 * Get All Suppliers
 * GET /suppliers
 */
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await apiClient.get<{ suppliers: Supplier[] }>('/suppliers')
    return response.suppliers || []
  } catch (error: any) {
    console.error('Get suppliers error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.'
    )
  }
}

/**
 * Create Supplier
 * POST /suppliers
 * Authorization: Requires MANAGER role
 */
export const createSupplier = async (data: CreateSupplierRequest): Promise<Supplier> => {
  try {
    const response = await apiClient.post<{ supplier: Supplier }>('/suppliers', data)
    return response.supplier
  } catch (error: any) {
    console.error('Create supplier error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo nhà cung cấp. Chỉ quản lý mới được phép.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo nhà cung cấp. Vui lòng thử lại.'
    )
  }
}

/**
 * Update Supplier
 * PUT /suppliers/:id
 * Authorization: Requires MANAGER role
 */
export const updateSupplier = async (data: UpdateSupplierRequest): Promise<Supplier> => {
  try {
    // Extract id from data, send only the fields to update in body
    const { id, ...updateFields } = data
    const response = await apiClient.put<{ supplier: Supplier }>(`/suppliers/${id}`, updateFields)
    return response.supplier
  } catch (error: any) {
    console.error('Update supplier error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền cập nhật nhà cung cấp.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể cập nhật nhà cung cấp. Vui lòng thử lại.'
    )
  }
}

/**
 * Delete Supplier
 * DELETE /suppliers/:id
 * Authorization: Requires MANAGER role
 */
export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    console.log('Deleting supplier with ID:', id, 'URL:', `/suppliers/${id}`)
    await apiClient.delete(`/suppliers/${id}`)
    console.log('Delete successful')
  } catch (error: any) {
    console.error('Delete supplier error:', error)
    console.error('Error response:', error.response)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền xóa nhà cung cấp.')
    }
    
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy nhà cung cấp. Có thể đã bị xóa hoặc không tồn tại.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể xóa nhà cung cấp. Vui lòng thử lại.'
    )
  }
}
