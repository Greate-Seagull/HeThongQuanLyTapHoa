import { PrismaClient } from "@prisma/client";

export class ProductReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getProductDetailById(id: any) {
		return await this.prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				price: true,
				unit: true,
			},
		});
	}

	async existByIds(ids: number[]): Promise<boolean> {
		const count = await this.prisma.product.count({
			where: { id: { in: ids } },
		});

		return count === ids.length;
	}
}
