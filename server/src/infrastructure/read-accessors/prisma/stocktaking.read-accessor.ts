import { PrismaClient } from "@prisma/client";
import { StocktakingReadAccessor as IStocktakingReadAccessor } from "../../../application/read-accessors/stocktaking.read-accessor";

export class StocktakingReadAccessor implements IStocktakingReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getAll(page: number, pageSize: number) {
		const skip = (page - 1) * pageSize;

		const [data, total] = await Promise.all([
			this.prisma.stocktaking.findMany({
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
				include: {
					employee: {
						select: {
							id: true,
							name: true,
							position: true,
						},
					},
					stocktakingDetails: {
						include: {
							product: {
								include: {
									category: true,
								},
							},
							slot: {
								include: {
									rack: {
										include: {
											shelf: true,
										},
									},
								},
							},
						},
					},
				},
			}),
			this.prisma.stocktaking.count(),
		]);

		// Debug log để kiểm tra
		if (data.length > 0) {
			console.log('🔍 First stocktaking from DB:', {
				id: data[0].id,
				employeeId: data[0].employeeId,
				employeeName: data[0].employee?.name,
			});
		}

		return {
			data,
			total,
			page,
			pageSize,
		};
	}
}
