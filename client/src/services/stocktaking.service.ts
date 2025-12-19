import { apiClient } from './api-client'
import { 
  Stocktaking,
  StocktakingWithDetails,
  CreateStocktakingRequest 
} from '@/types'

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
export const createStocktaking = async (data: CreateStocktakingRequest) => {
  try {
    const response = await apiClient.post<any>('/stocktakings', data)
    return response
  } catch (error: any) {
    console.error('Create stocktaking error:', error)
    throw new Error(
      error.response?.data?.message || 'Không thể tạo phiếu kiểm kê'
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
 * Get All Stocktakings
 * GET /stocktakings
 */
export const getStocktakings = async (page: number = 1, pageSize: number = 100) => {
  try {
    const response = await apiClient.get<any>(`/stocktakings?page=${page}&pageSize=${pageSize}`)
    return response
  } catch (error: any) {
    console.error('Get stocktakings error:', error)
    throw new Error(
      error.response?.data?.message || 'Không thể tải danh sách phiếu kiểm kê'
    )
  }
}

/**
 * Get Stocktaking by ID (NOT IMPLEMENTED)
 * Expected: GET /stocktakings/:id
 */
export const getStocktakingById = async (
  stocktakingId: number
): Promise<StocktakingWithDetails> => {
  throw new Error(
    'Chức năng xem chi tiết phiếu kiểm kê chưa được backend hỗ trợ. ' +
    'Cần endpoint: GET /stocktakings/:id'
  )
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
 * Update Stocktaking
 * PUT /stocktakings/:id
 */
export const updateStocktaking = async (
  id: number,
  data: CreateStocktakingRequest
) => {
  try {
    const response = await apiClient.put<any>(`/stocktakings/${id}`, data)
    return response
  } catch (error: any) {
    console.error('Update stocktaking error:', error)
    if (error.response?.status === 501) {
      throw new Error('Chức năng cập nhật phiếu kiểm kê chưa được backend hỗ trợ')
    }
    throw new Error(
      error.response?.data?.message || 'Không thể cập nhật phiếu kiểm kê'
    )
  }
}

/**
 * Delete Stocktaking
 * DELETE /stocktakings/:id
 */
export const deleteStocktaking = async (id: number) => {
  try {
    await apiClient.delete(`/stocktakings/${id}`)
  } catch (error: any) {
    console.error('Delete stocktaking error:', error)
    if (error.response?.status === 501) {
      throw new Error('Chức năng xóa phiếu kiểm kê chưa được backend hỗ trợ')
    }
    throw new Error(
      error.response?.data?.message || 'Không thể xóa phiếu kiểm kê'
    )
  }
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
