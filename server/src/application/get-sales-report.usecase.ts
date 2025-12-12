import { ReportReadAccessor } from "../infrastructure/read-accessors/report.read-accessor";

export interface GetSalesReportInput {
	startDate?: string;
	endDate?: string;
	employeeId?: number;
	userId?: number;
	authId: number;
}

export class GetSalesReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetSalesReportInput) {
		const { startDate, endDate, employeeId, userId } = input;

		const sales = await this.reportReadAccessor.getSalesReport({
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			employeeId,
			userId,
		});

		const summary = {
			totalInvoices: sales.length,
			totalRevenue: sales.reduce((sum, inv) => sum + inv.total, 0),
			totalQuantity: sales.reduce(
				(sum, inv) => sum + inv.totalQuantity,
				0
			),
			averageInvoiceValue:
				sales.length > 0
					? Math.round(
							sales.reduce((sum, inv) => sum + inv.total, 0) /
								sales.length
					  )
					: 0,
			totalPointsUsed: sales.reduce(
				(sum, inv) => sum + inv.usedPoint,
				0
			),
		};

		return {
			summary,
			sales,
		};
	}
}
