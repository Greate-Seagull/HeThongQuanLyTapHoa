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
					employee: true,
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

		return {
			data,
			total,
			page,
			pageSize,
		};
	}
}
