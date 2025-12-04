import { apiClient } from './api-client'
import { 
  Promotion,
  PromotionWithDetails,
  CreatePromotionRequest 
} from '@/types'

// ======================
// PROMOTION SERVICE API CALLS
// ======================

/**
 * Create Promotion
 * POST /promotions
 * Authorization: Requires ADMIN role
 * 
 * ⚠️ AUTHORIZATION: Only ADMIN can create promotions
 * SALES/INVENTORY/RECEIVING staff cannot access this endpoint
 */
export const createPromotion = async (
  data: CreatePromotionRequest
): Promise<Promotion> => {
  try {
    const response = await apiClient.post<Promotion>('/promotions', data)
    return response
  } catch (error: any) {
    console.error('Create promotion error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo khuyến mãi. Chỉ quản trị viên mới được phép.')
    }
    
    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || 
        'Dữ liệu khuyến mãi không hợp lệ.'
      )
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo khuyến mãi. Vui lòng thử lại.'
    )
  }
}

/**
 * ⚠️ MISSING ENDPOINTS (Commonly needed for promotion management):
 * 
 * 1. GET /promotions - Get all promotions
 * 2. GET /promotions/:id - Get promotion details
 * 3. GET /promotions/active - Get currently active promotions
 * 4. PUT /promotions/:id - Update promotion
 * 5. DELETE /promotions/:id - Delete promotion
 * 6. GET /promotions?productId=... - Get promotions for a product
 * 
 * Frontend typically needs:
 * - List all promotions (for management page)
 * - Get active promotions (for invoice creation)
 * - Update/delete promotions (for management)
 */

/**
 * Get All Promotions (NOT IMPLEMENTED - Endpoint doesn't exist)
 * Expected: GET /promotions
 */
export const getPromotions = async (): Promise<Promotion[]> => {
  throw new Error(
    'Chức năng lấy danh sách khuyến mãi chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /promotions'
  )
}

/**
 * Get Active Promotions (NOT IMPLEMENTED)
 * Expected: GET /promotions/active
 * 
 * This is critical for invoice creation - need to show available promotions
 */
export const getActivePromotions = async (): Promise<Promotion[]> => {
  throw new Error(
    'Chức năng lấy khuyến mãi đang hoạt động chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /promotions/active'
  )
}

/**
 * Get Promotion by ID (NOT IMPLEMENTED)
 * Expected: GET /promotions/:id
 */
export const getPromotionById = async (
  promotionId: number
): Promise<PromotionWithDetails> => {
  throw new Error(
    'Chức năng xem chi tiết khuyến mãi chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /promotions/:id'
  )
}

/**
 * Update Promotion (NOT IMPLEMENTED)
 * Expected: PUT /promotions/:id
 */
export const updatePromotion = async (
  promotionId: number,
  updates: Partial<CreatePromotionRequest>
): Promise<Promotion> => {
  throw new Error(
    'Chức năng cập nhật khuyến mãi chưa được backend hỗ trợ. ' +
    'Cần endpoint: PUT /promotions/:id'
  )
}

/**
 * Delete Promotion (NOT IMPLEMENTED)
 * Expected: DELETE /promotions/:id
 */
export const deletePromotion = async (promotionId: number): Promise<void> => {
  throw new Error(
    'Chức năng xóa khuyến mãi chưa được backend hỗ trợ. ' +
    'Cần endpoint: DELETE /promotions/:id'
  )
}

/**
 * Get Promotions for Product (NOT IMPLEMENTED)
 * Expected: GET /promotions?productId=...
 * 
 * Useful when showing product details with applicable promotions
 */
export const getPromotionsForProduct = async (
  productId: number
): Promise<Promotion[]> => {
  throw new Error(
    'Chức năng lấy khuyến mãi theo sản phẩm chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /promotions?productId=' + productId
  )
}
