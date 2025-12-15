import { ReportReadAccessor } from "../../../infrastructure/read-accessors/prisma/report.read-accessor";

export interface GetRevenueProfitReportInput {
	startDate?: string;
	endDate?: string;
	groupBy?: "product" | "category" | "time";
	authId: number;
}

export class GetRevenueProfitReportUsecase {
	constructor(private reportReadAccessor: ReportReadAccessor) {}

	async execute(input: GetRevenueProfitReportInput) {
		const { startDate, endDate, groupBy = "time" } = input;

		const report = await this.reportReadAccessor.getRevenueProfitReport({
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			groupBy,
		});

		return report;
	}
}
