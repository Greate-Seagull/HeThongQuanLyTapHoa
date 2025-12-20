import { PrismaClient } from "@prisma/client";
import { GoodReceiptReadAccessor } from "../../../application/services/read-accessors/good-receipt.read-accessor";

export class GoodReceiptPrismaReadAccessor implements GoodReceiptReadAccessor {
	constructor(private readonly client: PrismaClient) {}

	async getAll(page: number, pageSize: number) {
		const skip = (page - 1) * pageSize;
		
		const [data, total] = await Promise.all([
			this.client.goodReceipt.findMany({
				skip,
				take: pageSize,
				include: {
					employee: {
						select: {
							id: true,
							name: true,
							position: true,
						},
					},
					goodReceiptDetails: {
						include: {
							product: {
								select: {
									id: true,
									name: true,
									barcode: true,
									unit: true,
								},
							},
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			}),
			this.client.goodReceipt.count(),
		]);

		return { data, total, page, pageSize };
	}
}
