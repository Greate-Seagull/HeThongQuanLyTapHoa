import { ReportReadAccessor } from "../../../infrastructure/read-accessors/prisma/report.read-accessor";

export interface GetInventoryReportInput {
	lowStockThreshold?: number;
	authId: number;
}

export class GetInventoryReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetInventoryReportInput) {
		console.log(
			"GetInventoryReportUsecase.execute called with input:",
			input
		);

		const { lowStockThreshold = 10 } = input;

		const inventory = await this.reportReadAccessor.getInventoryReport(
			lowStockThreshold
		);

		const result = {
			summary: {
				totalProducts: inventory.length,
				lowStockProducts: inventory.filter((p) => p.isLowStock).length,
				outOfStockProducts: inventory.filter((p) => p.amount === 0)
					.length,
				totalValue: inventory.reduce(
					(sum, p) => sum + p.amount * p.price,
					0
				),
			},
			products: inventory,
		};

		console.log(
			"GetInventoryReportUsecase.execute result summary:",
			result.summary
		);

		return result;
	}
}
