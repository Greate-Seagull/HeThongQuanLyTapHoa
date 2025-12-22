import { apiClient } from './api-client';
import type { Shelf } from '@/types';

/**
 * Get All Shelves with Racks and Slots
 * GET /shelves
 */
export const getShelves = async (): Promise<Shelf[]> => {
  try {
    console.log('📦 Fetching shelves...');
    const response = await apiClient.get<Shelf[]>('/shelves');
    console.log('📦 Shelves response:', response);
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    console.error('Get shelves error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Không thể tải danh sách kho. Vui lòng thử lại.'
    );
  }
};
