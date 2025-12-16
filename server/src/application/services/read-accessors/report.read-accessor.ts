export interface ReportReadAccessor {
	getInventoryReport(lowStockThreshold: number): Promise<any[]>;
	getGoodsReceiptReport(params: {
		startDate?: Date;
		endDate?: Date;
		supplierId?: number;
	}): Promise<any[]>;
	getSalesReport(params: {
		startDate?: Date;
		endDate?: Date;
		employeeId?: number;
		userId?: number;
	}): Promise<any[]>;
	getCustomerReport(orderBy: "point" | "totalSpent"): Promise<any[]>;
	getStocktakingReport(params: {
		startDate?: Date;
		endDate?: Date;
		hasDiscrepancy?: boolean;
	}): Promise<any[]>;
}
