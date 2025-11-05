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
}
