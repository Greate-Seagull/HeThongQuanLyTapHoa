import { apiClient } from './api-client';

export interface CreateStocktakingRequest {
  // ❌ DON'T send authId - backend extracts from token
  products: {
    barcode: number;
    slotId: number;
    status: 'GOOD' | 'EXPIRED';
    quantity: number;
  }[];
}

export interface UpdateStocktakingRequest extends CreateStocktakingRequest {}

export interface GetStocktakingsResponse {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
}

export async function createStocktaking(data: CreateStocktakingRequest) {
  console.log('📤 Creating stocktaking (authId from token):', data);
  return await apiClient.post<any>('/stocktakings', data);
}

export async function getStocktakings(page: number = 1, pageSize: number = 100): Promise<GetStocktakingsResponse> {
  console.log('📥 Fetching stocktakings:', { page, pageSize });
  const response = await apiClient.get<GetStocktakingsResponse>('/stocktakings', {
    params: { page, pageSize },
  });
  return response;
}

export async function updateStocktaking(id: number, data: UpdateStocktakingRequest) {
  console.log('📤 Updating stocktaking #', id, '(authId from token):', data);
  return await apiClient.put<any>(`/stocktakings/${id}`, data);
}

export async function deleteStocktaking(id: number) {
  console.log('🗑️ Deleting stocktaking #', id);
  return await apiClient.delete<any>(`/stocktakings/${id}`);
}
