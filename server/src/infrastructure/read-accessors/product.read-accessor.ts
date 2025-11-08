import { PrismaClient } from "@prisma/client";

export class ProductReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getProductIncludePromotionId(id: any) {
		return await this.prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				price: true,
				unit: true,
				promotionDetails: {
					select: {
						promotionId: true,
					},
				},
			},
		});
	}

	async existByIds(ids: number[]): Promise<boolean> {
		const count = await this.prisma.product.count({
			where: { id: { in: ids } },
		});

		return count === ids.length;
	}

	async getProducts() {
		return await this.prisma.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
				unit: true,
				barcode: true,
			},
		});
	}

	async getIdsByBarcodes(barcodes: number[]) {
		const count = await this.prisma.product.findMany({
			where: { barcode: { in: barcodes } },
			select: {
				id: true,
				barcode: true,
			},
		});

		return count;
	}
}
