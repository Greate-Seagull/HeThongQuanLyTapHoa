import { apiClient } from './api-client'
import { Stocktaking, StocktakingWithDetails, CreateStocktakingRequest } from '@/types'

// ======================
// STOCKTAKING SERVICE API CALLS
// ======================

/**
 * Create Stocktaking (Phiếu Kiểm Kê)
 * POST /stocktakings
 * Authorization: Requires INVENTORY position
 *
 * ✅ GOOD: Authorization is position-based (INVENTORY)
 * Only inventory staff can create stocktakings
 *
 * Body format:
 * {
 *   employeeId: number,
 *   details: [
 *     { productId, slotId, status, quantity }
 *   ]
 * }
 *
 * ⚠️ QUESTION: What happens after stocktaking is created?
 * - Does it automatically update product amounts?
 * - Or is there an approval/apply step?
 *
 * ⚠️ DEPENDENCY: Requires Slot system to be set up
 * (Shelf → Rack → Slot structure)
 */
export const createStocktaking = async (data: CreateStocktakingRequest): Promise<Stocktaking> => {
  try {
    const response = await apiClient.post<Stocktaking>('/stocktakings', data)
    return response
  } catch (error: any) {
    console.error('Create stocktaking error:', error)

    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo phiếu kiểm kê. Chỉ nhân viên kiểm kê mới được phép.')
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Dữ liệu phiếu kiểm kê không hợp lệ.')
    }

    if (error.response?.status === 404) {
      throw new Error('Sản phẩm hoặc vị trí kho không tồn tại.')
    }

    throw new Error(
      error.response?.data?.message || 'Không thể tạo phiếu kiểm kê. Vui lòng thử lại.'
    )
  }
}

/**
 * ⚠️ MISSING ENDPOINTS (Commonly needed for stocktaking management):
 *
 * 1. GET /stocktakings - Get all stocktakings (with pagination)
 * 2. GET /stocktakings/:id - Get stocktaking details
 * 3. GET /stocktakings/employee/:employeeId - Get stocktakings by employee
 * 4. GET /stocktakings/today - Get today's stocktakings
 * 5. GET /stocktakings/stats - Get stocktaking statistics
 * 6. PUT /stocktakings/:id - Update stocktaking (before finalizing)
 * 7. DELETE /stocktakings/:id - Delete stocktaking
 * 8. POST /stocktakings/:id/apply - Apply stocktaking adjustments
 * 9. GET /stocktakings/discrepancies - Get products with discrepancies
 *
 * Also need Slot/Rack/Shelf management endpoints:
 * 10. GET /shelves - Get warehouse structure
 * 11. GET /slots - Get all storage slots
 * 12. GET /slots/:id/products - Get products in a slot
 */

/**
 * Get All Stocktakings (NOT IMPLEMENTED)
 * Expected: GET /stocktakings
 */
export const getStocktakings = async (): Promise<StocktakingWithDetails[]> => {
  try {
    const response = await apiClient.get<StocktakingWithDetails[]>('/stocktakings')
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Không thể lấy danh sách phiếu kiểm kê.')
  }
}

/**
 * Get Stocktaking by ID (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/:id
 */
export const getStocktakingById = async (
  stocktakingId: number
): Promise<StocktakingWithDetails> => {
  try {
    const response = await apiClient.get<StocktakingWithDetails>(`/stocktakings/${stocktakingId}`)
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Không thể lấy chi tiết phiếu kiểm kê.')
  }
}

/**
 * Get Stocktakings by Employee (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/employee/:employeeId
 */
export const getStocktakingsByEmployee = async (
  employeeId: number
): Promise<StocktakingWithDetails[]> => {
  throw new Error(
    'Chức năng xem phiếu kiểm kê theo nhân viên chưa được backend hỗ trợ. ' +
      'Cần endpoint: GET /stocktakings/employee/:id'
  )
}

/**
 * Get Today's Stocktakings (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/today
 */
export const getTodayStocktakings = async (): Promise<StocktakingWithDetails[]> => {
  throw new Error(
    'Chức năng xem phiếu kiểm kê hôm nay chưa được backend hỗ trợ. ' +
      'Cần endpoint: GET /stocktakings/today'
  )
}

/**
 * Get Stocktaking Statistics (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/stats
 */
export interface StocktakingStats {
  totalStocktakings: number
  productsChecked: number
  discrepanciesFound: number
  lastStocktakingDate: string
}

export const getStocktakingStats = async (): Promise<StocktakingStats> => {
  throw new Error(
    'Chức năng xem thống kê kiểm kê chưa được backend hỗ trợ. ' +
      'Cần endpoint: GET /stocktakings/stats'
  )
}

/**
 * Get Inventory Discrepancies (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/discrepancies
 *
 * Shows products where counted quantity differs from system quantity
 */
export interface InventoryDiscrepancy {
  productId: number
  productName: string
  systemQuantity: number
  countedQuantity: number
  difference: number
  slotId: number
  slotName: string
}

export const getInventoryDiscrepancies = async (): Promise<InventoryDiscrepancy[]> => {
  throw new Error(
    'Chức năng xem chênh lệch tồn kho chưa được backend hỗ trợ. ' +
      'Cần endpoint: GET /stocktakings/discrepancies'
  )
}

/**
 * Update Stocktaking (NOT IMPLEMENTED)
 * Expected: PUT /stocktakings/:id
 */
export const updateStocktaking = async (
  stocktakingId: number,
  updates: Partial<CreateStocktakingRequest>
): Promise<Stocktaking> => {
  try {
    const response = await apiClient.put<Stocktaking>(`/stocktakings/${stocktakingId}`, updates)
    return response
  } catch (error: any) {
    console.error('Create stocktaking error:', error)

    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo phiếu kiểm kê. Chỉ nhân viên kiểm kê mới được phép.')
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Dữ liệu phiếu kiểm kê không hợp lệ.')
    }

    if (error.response?.status === 404) {
      throw new Error('Sản phẩm hoặc vị trí kho không tồn tại.')
    }

    throw new Error(
      error.response?.data?.message || 'Không thể tạo phiếu kiểm kê. Vui lòng thử lại.'
    )
  }
}

/**
 * Delete Stocktaking (NOT IMPLEMENTED)
 * Expected: DELETE /stocktakings/:id
 */
export const deleteStocktaking = async (stocktakingId: number): Promise<void> => {
  throw new Error(
    'Chức năng xóa phiếu kiểm kê chưa được backend hỗ trợ. ' +
      'Cần endpoint: DELETE /stocktakings/:id'
  )
}

/**
 * Apply Stocktaking Adjustments (NOT IMPLEMENTED)
 * Expected: POST /stocktakings/:id/apply
 *
 * Updates product quantities based on stocktaking results
 */
export const applyStocktaking = async (stocktakingId: number): Promise<void> => {
  throw new Error(
    'Chức năng áp dụng điều chỉnh kiểm kê chưa được backend hỗ trợ. ' +
      'Cần endpoint: POST /stocktakings/:id/apply'
  )
}

// ======================
// WAREHOUSE STRUCTURE APIs (NEEDED)
// ======================

/**
 * ⚠️ CRITICAL MISSING: Warehouse structure management
 *
 * Stocktaking requires Shelf/Rack/Slot system but no APIs exist for:
 * - Creating shelves, racks, slots
 * - Viewing warehouse structure
 * - Assigning products to slots
 *
 * Needed endpoints:
 * - GET /shelves - List all shelves
 * - POST /shelves - Create shelf
 * - GET /racks - List all racks
 * - POST /racks - Create rack
 * - GET /slots - List all slots
 * - POST /slots - Create slot
 * - PUT /slots/:id/products - Assign product to slot
 */
