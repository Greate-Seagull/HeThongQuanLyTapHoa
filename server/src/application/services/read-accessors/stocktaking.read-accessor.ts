export interface StocktakingReadAccessor {
	getAll(page: number, pageSize: number): Promise<{
		data: any[];
		total: number;
	}>;
	getById(id: number): Promise<any | null>;
}
