import { ReportReadAccessor } from "../infrastructure/read-accessors/report.read-accessor";

export interface GetGoodsReceiptReportInput {
	startDate?: string; // ISO string
	endDate?: string; // ISO string
	supplierId?: number;
	authId: number;
}

export class GetGoodsReceiptReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetGoodsReceiptReportInput) {
		const { startDate, endDate, supplierId } = input;

		const goodReceipts =
			await this.reportReadAccessor.getGoodsReceiptReport({
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				supplierId,
			});

		const summary = {
			totalGoodReceipts: goodReceipts.length,
			totalAmount: goodReceipts.reduce((sum, gr) => sum + gr.totalAmount, 0),
			totalQuantity: goodReceipts.reduce(
				(sum, gr) => sum + gr.totalQuantity,
				0
			),
			averageAmount:
				goodReceipts.length > 0
					? Math.round(
							goodReceipts.reduce((sum, gr) => sum + gr.totalAmount, 0) /
								goodReceipts.length
					  )
					: 0,
		};

		return {
			summary,
			goodReceipts,
		};
	}
}
