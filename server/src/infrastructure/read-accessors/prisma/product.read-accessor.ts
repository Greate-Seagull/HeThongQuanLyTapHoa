import { PrismaReadAccessor } from "./prisma.read-accessor";
import { ProductReadAccessor } from "../../../application/services/read-accessors/product.read-accessor";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { PromotionId } from "../../../domain/entities/promotion";

export class ProductPrismaReadAccessor
	extends PrismaReadAccessor
	implements ProductReadAccessor
{
	async getProductIncludePromotionId(id: ProductId): Promise<{
		id: ProductId;
		name: string;
		price: number;
		unit: string;
		promotionDetails: {
			promotionId: PromotionId;
		}[];
	}> {
		return await this.client.product.findUnique({
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

	async existByIds(ids: ProductId[]): Promise<boolean> {
		const count = await this.client.product.count({
			where: { id: { in: ids } },
		});

		return count === ids.length;
	}

	async getProducts(
		page: number,
		limit: number
	): Promise<
		{
			id: ProductId;
			name: string;
			price: number;
			unit: string;
			barcode: ProductBarcode;
		}[]
	> {
		const skip = (page - 1) * limit;
		return await this.client.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
				unit: true,
				barcode: true,
			},
			orderBy: {
				name: "asc",
			},
			skip,
			take: limit,
		});
	}

	async getIdsByBarcodes(
		barcodes: ProductBarcode[]
	): Promise<{ id: ProductId; barcode: ProductBarcode }[]> {
		const count = await this.client.product.findMany({
			where: { barcode: { in: barcodes } },
			select: {
				id: true,
				barcode: true,
			},
		});

		return count;
	}
}
