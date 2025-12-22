import { PrismaClient } from "@prisma/client";
import { StocktakingReadAccessor as IStocktakingReadAccessor } from "../../../application/services/read-accessors/stocktaking.read-accessor";

export class StocktakingReadAccessor implements IStocktakingReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getAll(page: number, pageSize: number) {
		const skip = (page - 1) * pageSize;
		
		const [data, total] = await Promise.all([
			this.prisma.stocktaking.findMany({
				skip,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
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
								select: {
									id: true,
									name: true,
									barcode: true,
								},
							},
							slot: {
								include: {
									rack: {
										include: {
											shelf: {
												select: {
													id: true,
													name: true,
												},
											},
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

		return { data, total };
	}

	async getById(id: number) {
		return await this.prisma.stocktaking.findUnique({
			where: { id },
			include: {
				employee: true,
				stocktakingDetails: {
					include: {
						product: true,
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
		});
	}
}
