import { PrismaClient } from "@prisma/client";

export class InventoryReadAccessor {
	constructor(private readonly client: PrismaClient) {}

	/**
	 * Lấy số lượng tồn kho hiện tại của sản phẩm tại slot
	 * @param productId ID của sản phẩm
	 * @param slotId ID của slot
	 * @returns Số lượng tồn kho hiện tại
	 */
	async getQuantity(productId: number, slotId: number): Promise<number> {
		const inventory = await this.client.inventory.findUnique({
			where: {
				productId_slotId: {
					productId,
					slotId,
				},
			},
			select: {
				quantity: true,
			},
		});

		return inventory?.quantity ?? 0;
	}

	/**
	 * Lấy thông tin tồn kho chi tiết
	 */
	async getInventoryDetail(productId: number, slotId: number) {
		return this.client.inventory.findUnique({
			where: {
				productId_slotId: {
					productId,
					slotId,
				},
			},
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
		});
	}

	/**
	 * Kiểm tra xem có đủ số lượng để xuất không
	 */
	async hasEnoughQuantity(
		productId: number,
		slotId: number,
		requiredQuantity: number
	): Promise<boolean> {
		const currentQuantity = await this.getQuantity(productId, slotId);
		return currentQuantity >= requiredQuantity;
	}
}