import { apiClient } from './api-client'
import type { Shelf } from '@/types'

export const getShelves = async (): Promise<Shelf[]> => {
  try {
    const response = await apiClient.get<Shelf[]>('/shelves')
    console.log('Get shelves response:', response)
    return response
  } catch (error: any) {
    console.error('Get shelves error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách kệ hàng. Vui lòng thử lại.'
    )
  }
}
