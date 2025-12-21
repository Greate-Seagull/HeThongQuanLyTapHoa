import { apiClient } from './api-client'
import { 
  Invoice,
  InvoiceWithDetails,
  CreateInvoiceRequest 
} from '@/types'

// ======================
// INVOICE SERVICE API CALLS
// ======================

/**
 * Create Invoice
 * POST /invoices
 * Authorization: Requires SALES position
 * 
 * ✅ GOOD: Authorization is position-based (SALES)
 * Only sales staff can create invoices
 * 
 * Body format:
 * {
 *   employeeId: number,
 *   userId?: number | null,
 *   usedPoint?: number,
 *   details: [
 *     { productId, quantity, promotionId? }
 *   ]
 * }
 */
export const createInvoice = async (
  data: CreateInvoiceRequest
): Promise<Invoice> => {
  try {
    const response = await apiClient.post<Invoice>('/invoices', data)
    return response
  } catch (error: any) {
    console.error('Create invoice error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo hóa đơn. Chỉ nhân viên bán hàng mới được phép.')
    }
    
    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || 
        'Dữ liệu hóa đơn không hợp lệ.'
      )
    }
    
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm hoặc khuyến mãi không tồn tại.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo hóa đơn. Vui lòng thử lại.'
    )
  }
}

/**
 * ⚠️ MISSING ENDPOINTS (Commonly needed for invoice management):
 * 
 * 1. GET /invoices - Get all invoices (with pagination)
 * 2. GET /invoices/:id - Get invoice details
 * 3. GET /invoices/employee/:employeeId - Get invoices by employee
 * 4. GET /invoices/customer/:userId - Get invoices by customer
 * 5. GET /invoices/today - Get today's invoices
 * 6. GET /invoices/stats - Get invoice statistics (total sales, etc.)
 * 7. DELETE /invoices/:id - Cancel invoice (if needed)
 * 
 * Frontend typically needs:
 * - View invoice history (for management and reports)
 * - View employee's sales performance
 * - View customer's purchase history
 * - Daily/monthly sales reports
 */

/**
 * Get All Invoices (NOT IMPLEMENTED)
 * Expected: GET /invoices
 * 
 * Should support pagination: GET /invoices?page=1&pageSize=20
 */


export const getInvoices = async (): Promise<InvoiceWithDetails[]> => {
  const res = await apiClient.get<InvoiceWithDetails[]>('/invoices');
  return res;
}

/**
 * Get Invoice by ID (NOT IMPLEMENTED)
 * Expected: GET /invoices/:id
 */


export const getInvoiceById = async (invoiceId: number): Promise<InvoiceWithDetails> => {
  const res = await apiClient.get<InvoiceWithDetails>(`/invoices/${invoiceId}`);
  return res;
}

/**
 * Get Invoices by Employee (NOT IMPLEMENTED)
 * Expected: GET /invoices/employee/:employeeId
 * 
 * Useful for viewing sales performance of each employee
 */
export const getInvoicesByEmployee = async (
  employeeId: number
): Promise<InvoiceWithDetails[]> => {
  throw new Error(
    'Chức năng xem hóa đơn theo nhân viên chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /invoices/employee/:id'
  )
}

/**
 * Get Invoices by Customer (NOT IMPLEMENTED)
 * Expected: GET /invoices/customer/:userId
 * 
 * Useful for customer purchase history
 */
export const getInvoicesByCustomer = async (
  userId: number
): Promise<InvoiceWithDetails[]> => {
  throw new Error(
    'Chức năng xem lịch sử mua hàng chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /invoices/customer/:id'
  )
}

/**
 * Get Today's Invoices (NOT IMPLEMENTED)
 * Expected: GET /invoices/today
 * 
 * Useful for daily sales report
 */
export const getTodayInvoices = async (): Promise<InvoiceWithDetails[]> => {
  throw new Error(
    'Chức năng xem hóa đơn hôm nay chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /invoices/today'
  )
}

/**
 * Get Invoice Statistics (NOT IMPLEMENTED)
 * Expected: GET /invoices/stats
 * 
 * Response: { totalSales, totalInvoices, averageValue, etc. }
 */
export interface InvoiceStats {
  totalSales: number
  totalInvoices: number
  averageValue: number
  todaySales: number
  monthSales: number
}

export const getInvoiceStats = async (): Promise<InvoiceStats> => {
  throw new Error(
    'Chức năng xem thống kê hóa đơn chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /invoices/stats'
  )
}

/**
 * Cancel Invoice (NOT IMPLEMENTED)
 * Expected: DELETE /invoices/:id or PUT /invoices/:id/cancel
 * 
 * May be needed for error corrections
 */
export const cancelInvoice = async (invoiceId: number): Promise<void> => {
  throw new Error(
    'Chức năng hủy hóa đơn chưa được backend hỗ trợ. ' +
    'Cần endpoint: DELETE /invoices/:id hoặc PUT /invoices/:id/cancel'
  )
}
