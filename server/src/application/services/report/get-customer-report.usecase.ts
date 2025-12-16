import { ReportReadAccessor } from "../read-accessors/report.read-accessor";

export interface GetCustomerReportInput {
	orderBy?: "point" | "totalSpent";
	authId: number;
}

export class GetCustomerReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetCustomerReportInput) {
		const { orderBy = "point" } = input;

		const customers = await this.reportReadAccessor.getCustomerReport(
			orderBy
		);

		const summary = {
			totalCustomers: customers.length,
			totalPoints: customers.reduce((sum, c) => sum + c.currentPoints, 0),
			totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
			totalPointsUsed: customers.reduce(
				(sum, c) => sum + c.totalPointsUsed,
				0
			),
			averageSpent:
				customers.length > 0
					? Math.round(
							customers.reduce(
								(sum, c) => sum + c.totalSpent,
								0
							) / customers.length
					  )
					: 0,
		};

		return {
			summary,
			customers,
		};
	}
}
