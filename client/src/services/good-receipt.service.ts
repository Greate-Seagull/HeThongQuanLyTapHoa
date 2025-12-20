import { apiClient } from './api-client'
import { 
  GoodReceipt,
  GoodReceiptWithDetails,
} from '@/types'

export interface CreateGoodReceiptRequest {
  authId: number
  items: {
    productId: number
    quantity: number
    price: number
  }[]
}

// ======================
// GOOD RECEIPT SERVICE API CALLS
// ======================

/**
 * Create Good Receipt (Phiếu Nhập Kho)
 * POST /good-receipts
 * Authorization: Requires RECEIVING position
 * 
 * ✅ GOOD: Authorization is position-based (RECEIVING)
 * Only receiving staff can create good receipts
 * 
 * Body format:
 * {
 *   employeeId: number,
 *   details: [
 *     { productId, quantity, price }
 *   ]
 * }
 * 
 * ⚠️ QUESTION: Does this automatically update product inventory (amount)?
 * Or is there a separate step to apply the receipt?
 */
export const createGoodReceipt = async (data: CreateGoodReceiptRequest) => {
  try {
    console.log('📤 Creating good receipt with payload:', JSON.stringify(data, null, 2));
    
    // ✅ Enhanced validation
    if (!data.authId || typeof data.authId !== 'number') {
      throw new Error(`Invalid authId: ${data.authId}`);
    }
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Items array is required and must not be empty');
    }
    
    // Validate each item
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      console.log(`🔍 Validating item ${i}:`, item);
      
      if (!item.productId || typeof item.productId !== 'number') {
        throw new Error(`Item ${i}: Invalid productId = ${item.productId}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item ${i}: Invalid quantity = ${item.quantity}`);
      }
      if (!item.price || item.price <= 0) {
        throw new Error(`Item ${i}: Invalid price = ${item.price}`);
      }
    }
    
    console.log('✅ All validations passed, sending request...');
    const response = await apiClient.post<any>('/good-receipts', data);
    console.log('✅ Good receipt created successfully:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Create good receipt error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    const serverError = error.response?.data?.data || error.response?.data?.message || error.message;
    throw new Error(serverError || 'Không thể tạo phiếu nhập hàng');
  }
}

/**
 * Get All Good Receipts
 * GET /good-receipts
 */
export const getGoodReceipts = async (page: number = 1, pageSize: number = 100) => {
  try {
    const response = await apiClient.get<any>(`/good-receipts?page=${page}&pageSize=${pageSize}`)
    return response
  } catch (error: any) {
    console.error('Get good receipts error:', error)
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách phiếu nhập hàng'
    )
  }
}

/**
 * Update Good Receipt
 * PUT /good-receipts/:id
 * 
 * Useful for editing receipt before finalizing
 */
export const updateGoodReceipt = async (
  id: number,
  data: CreateGoodReceiptRequest
) => {
  try {
    const response = await apiClient.put<any>(`/good-receipts/${id}`, data)
    return response
  } catch (error: any) {
    console.error('Update good receipt error:', error)
    throw new Error(
      error.response?.data?.message || 'Không thể cập nhật phiếu nhập hàng'
    )
  }
}

/**
 * Delete Good Receipt
 * DELETE /good-receipts/:id
 * 
 * May be needed for error corrections
 */
export const deleteGoodReceipt = async (id: number) => {
  try {
    await apiClient.delete(`/good-receipts/${id}`)
  } catch (error: any) {
    console.error('Delete good receipt error:', error)
    throw new Error(
      error.response?.data?.message || 'Không thể xóa phiếu nhập hàng'
    )
  }
}

/**
 * ⚠️ MISSING ENDPOINTS (Commonly needed for good receipt management):
 * 
 * 1. GET /good-receipts - Get all good receipts (with pagination)
 * 2. GET /good-receipts/:id - Get good receipt details
 * 3. GET /good-receipts/employee/:employeeId - Get receipts by employee
 * 4. GET /good-receipts/today - Get today's receipts
 * 5. GET /good-receipts/stats - Get receiving statistics
 * 6. PUT /good-receipts/:id - Update receipt (before finalizing)
 * 7. DELETE /good-receipts/:id - Delete receipt (if not finalized)
 * 8. POST /good-receipts/:id/apply - Apply receipt to inventory (if not auto)
 * 
 * Frontend typically needs:
 * - View receipt history
 * - Track receiving employee performance
 * - View daily receiving reports
 * - Verify and edit receipts before finalizing
 */

/**
 * Get Good Receipt by ID (NOT IMPLEMENTED)
 * Expected: GET /good-receipts/:id
 */
export const getGoodReceiptById = async (
  receiptId: number
): Promise<GoodReceiptWithDetails> => {
  throw new Error(
    'Chức năng xem chi tiết phiếu nhập kho chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /good-receipts/:id'
  )
}

/**
 * Get Good Receipts by Employee (NOT IMPLEMENTED)
 * Expected: GET /good-receipts/employee/:employeeId
 */
export const getGoodReceiptsByEmployee = async (
  employeeId: number
): Promise<GoodReceiptWithDetails[]> => {
  throw new Error(
    'Chức năng xem phiếu nhập theo nhân viên chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /good-receipts/employee/:id'
  )
}

/**
 * Get Today's Good Receipts (NOT IMPLEMENTED)
 * Expected: GET /good-receipts/today
 */
export const getTodayGoodReceipts = async (): Promise<GoodReceiptWithDetails[]> => {
  throw new Error(
    'Chức năng xem phiếu nhập hôm nay chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /good-receipts/today'
  )
}

/**
 * Get Good Receipt Statistics (NOT IMPLEMENTED)
 * Expected: GET /good-receipts/stats
 */
export interface GoodReceiptStats {
  totalReceipts: number
  totalValue: number
  totalProducts: number
  todayReceipts: number
  monthReceipts: number
}

export const getGoodReceiptStats = async (): Promise<GoodReceiptStats> => {
  throw new Error(
    'Chức năng xem thống kê nhập hàng chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /good-receipts/stats'
  )
}
