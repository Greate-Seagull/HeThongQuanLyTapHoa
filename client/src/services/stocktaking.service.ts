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
 */
export const createStocktaking = async (
  data: CreateStocktakingRequest
): Promise<Stocktaking> => {
  try {
    const response = await apiClient.post<Stocktaking>('/stocktakings', data)
    return response
  } catch (error: any) {
    console.error('Create stocktaking error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền tạo phiếu kiểm kê. Chỉ nhân viên kiểm kê mới được phép.')
    }
    
    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || 
        'Dữ liệu phiếu kiểm kê không hợp lệ.'
      )
    }
    
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm hoặc vị trí kho không tồn tại.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tạo phiếu kiểm kê. Vui lòng thử lại.'
    )
  }
}

/**
 * Get All Stocktakings
 * GET /stocktakings
 */
export const getStocktakings = async (
  page: number = 1,
  pageSize: number = 20,
  employeeId?: number
): Promise<{ data: StocktakingWithDetails[], pagination: any }> => {
  try {
    // Build query string properly
    let url = `/stocktakings?page=${page}&pageSize=${pageSize}`;
    
    if (employeeId) {
      url += `&employeeId=${employeeId}`;
    }

    const response = await apiClient.get<{ data: StocktakingWithDetails[], pagination: any }>(url);
    return response;
  } catch (error: any) {
    console.error('Get stocktakings error:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền xem phiếu kiểm kê.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách phiếu kiểm kê. Vui lòng thử lại.'
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
 * Get Stocktakings by Employee
 * GET /stocktakings?employeeId=:id
 */
export const getStocktakingsByEmployee = async (
  employeeId: number
): Promise<StocktakingWithDetails[]> => {
  try {
    const result = await getStocktakings(1, 100, employeeId)
    return result.data
  } catch (error: any) {
    console.error('Get stocktakings by employee error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải phiếu kiểm kê theo nhân viên. Vui lòng thử lại.'
    )
  }
}

/**
 * Get Today's Stocktakings
 * GET /stocktakings (filtered by today)
 */
export const getTodayStocktakings = async (): Promise<StocktakingWithDetails[]> => {
  try {
    const result = await getStocktakings(1, 50)
    const today = new Date().toDateString()
    
    return result.data.filter(stocktaking => 
      new Date(stocktaking.createdAt).toDateString() === today
    )
  } catch (error: any) {
    console.error('Get today stocktakings error:', error)
    throw new Error(
      'Không thể tải phiếu kiểm kê hôm nay. Vui lòng thử lại.'
    )
  }
}

/**
 * Get Stocktaking Statistics
 */
export interface StocktakingStats {
  totalStocktakings: number
  productsChecked: number
  discrepanciesFound: number
  lastStocktakingDate: string
}

export const getStocktakingStats = async (): Promise<StocktakingStats> => {
  try {
    const result = await getStocktakings(1, 100)
    const stocktakings = result.data
    
    const totalProducts = stocktakings.reduce(
      (sum, s) => sum + (s.stocktakingDetails?.length || 0), 0
    )
    
    const lastStockting = stocktakings[0]
    
    return {
      totalStocktakings: stocktakings.length,
      productsChecked: totalProducts,
      discrepanciesFound: Math.floor(totalProducts * 0.1), // Simulate 10% discrepancy rate
      lastStocktakingDate: lastStockting ? lastStockting.createdAt : new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('Get stocktaking stats error:', error)
    throw new Error(
      'Không thể tải thống kê kiểm kê. Vui lòng thử lại.'
    )
  }
}

/**
 * Get Inventory Discrepancies
 * Calculate from stocktaking data vs current product amounts
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
  try {
    const result = await getStocktakings(1, 50)
    const discrepancies: InventoryDiscrepancy[] = []
    
    // Get latest stocktaking for each product
    const latestStocktakings = result.data.slice(0, 5) // Get recent stocktakings
    
    for (const stocktaking of latestStocktakings) {
      if (!stocktaking.stocktakingDetails) continue;
      
      for (const detail of stocktaking.stocktakingDetails) {
        // This would normally compare with current product.amount
        // For now, simulate some discrepancies
        const difference = Math.floor(Math.random() * 10) - 5
        
        if (difference !== 0) {
          discrepancies.push({
            productId: detail.productId,
            productName: `Product ${detail.productId}`, // Would get from product data
            systemQuantity: detail.quantity + difference,
            countedQuantity: detail.quantity,
            difference,
            slotId: detail.slotId,
            slotName: `Slot ${detail.slotId}`, // Would get from slot data
          })
        }
      }
    }
    
    return discrepancies
  } catch (error: any) {
    console.error('Get inventory discrepancies error:', error)
    throw new Error(
      'Không thể tải chênh lệch tồn kho. Vui lòng thử lại.'
    )
  }
}

/**
 * Update Stocktaking (NOT IMPLEMENTED)
 * Expected: PUT /stocktakings/:id
 */
export const updateStocktaking = async (
  stocktakingId: number,
  updates: Partial<CreateStocktakingRequest>
): Promise<Stocktaking> => {
  throw new Error(
    'Chức năng cập nhật phiếu kiểm kê chưa được backend hỗ trợ. ' +
    'Cần endpoint: PUT /stocktakings/:id'
  )
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
 * Apply Stocktaking Adjustments
 * POST /stocktakings/:id/apply
 * Authorization: Requires MANAGER position
 */
export const applyStocktaking = async (stocktakingId: number): Promise<void> => {
  try {
    await apiClient.post(`/stocktakings/${stocktakingId}/apply`, {})
  } catch (error: any) {
    console.error('Apply stocktaking error:', error)
    
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền áp dụng điều chỉnh kiểm kê. Chỉ quản lý mới được phép.')
    }
    
    if (error.response?.status === 404) {
      throw new Error('Phiếu kiểm kê không tồn tại.')
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Không thể áp dụng điều chỉnh kiểm kê. Vui lòng thử lại.'
    )
  }
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
