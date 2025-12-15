import { ReportReadAccessor } from "../../../infrastructure/read-accessors/prisma/report.read-accessor";

export interface GetStocktakingReportInput {
	startDate?: string;
	endDate?: string;
	hasDiscrepancy?: boolean;
	authId: number;
}

export class GetStocktakingReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetStocktakingReportInput) {
		const { startDate, endDate, hasDiscrepancy } = input;

		const stocktakings = await this.reportReadAccessor.getStocktakingReport(
			{
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				hasDiscrepancy,
			}
		);

		const allDetails = stocktakings.flatMap((st) => st.details);

		const summary = {
			totalStocktakings: stocktakings.length,
			totalProductsChecked: allDetails.length,
			totalDiscrepancies: allDetails.filter((d) => d.hasDiscrepancy)
				.length,
			totalDiscrepancyAmount: allDetails.reduce(
				(sum, d) => sum + Math.abs(d.discrepancy),
				0
			),
		};

		return {
			summary,
			stocktakings,
		};
	}
}
