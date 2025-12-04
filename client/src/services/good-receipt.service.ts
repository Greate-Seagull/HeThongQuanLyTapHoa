import { apiClient } from './api-client'
import { 
  GoodReceipt,
  GoodReceiptWithDetails,
  CreateGoodReceiptRequest 
} from '@/types'

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
export const createGoodReceipt = async (
  data: CreateGoodReceiptRequest
): Promise<GoodReceipt> => {
  try {
    const response = await apiClient.post<GoodReceipt>('/good-receipts', data)
    return response
  } catch (error: any) {
    console.error('Create good receipt error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo phiếu nhập kho. Chỉ nhân viên nhập hàng mới được phép.')
    }
    
    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || 
        'Dữ liệu phiếu nhập kho không hợp lệ.'
      )
    }
    
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm không tồn tại trong hệ thống.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo phiếu nhập kho. Vui lòng thử lại.'
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
 * Get All Good Receipts (NOT IMPLEMENTED)
 * Expected: GET /good-receipts
 */
export const getGoodReceipts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<GoodReceiptWithDetails[]> => {
  throw new Error(
    'Chức năng lấy danh sách phiếu nhập kho chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /good-receipts'
  )
}

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

/**
 * Update Good Receipt (NOT IMPLEMENTED)
 * Expected: PUT /good-receipts/:id
 * 
 * Useful for editing receipt before finalizing
 */
export const updateGoodReceipt = async (
  receiptId: number,
  updates: Partial<CreateGoodReceiptRequest>
): Promise<GoodReceipt> => {
  throw new Error(
    'Chức năng cập nhật phiếu nhập kho chưa được backend hỗ trợ. ' +
    'Cần endpoint: PUT /good-receipts/:id'
  )
}

/**
 * Delete Good Receipt (NOT IMPLEMENTED)
 * Expected: DELETE /good-receipts/:id
 * 
 * May be needed for error corrections
 */
export const deleteGoodReceipt = async (receiptId: number): Promise<void> => {
  throw new Error(
    'Chức năng xóa phiếu nhập kho chưa được backend hỗ trợ. ' +
    'Cần endpoint: DELETE /good-receipts/:id'
  )
}
