export interface GoodReceiptReadAccessor {
	getAll(
		page: number,
		pageSize: number
	): Promise<{
		data: any[];
		total: number;
		page: number;
		pageSize: number;
	}>;
}
