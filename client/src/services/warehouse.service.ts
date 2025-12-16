import { apiClient } from './api-client'
import type { Shelf } from '@/types'

/**
 * Get all shelves with racks and slots
 * GET /api/shelves
 */
export const getShelves = async (): Promise<Shelf[]> => {
  try {
    const response = await apiClient.get<Shelf[]>('/api/shelves')
    return response
  } catch (error: any) {
    console.error('Get shelves error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách kệ hàng. Vui lòng thử lại.'
    )
  }
}
