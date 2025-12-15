import { PrismaClient } from "@prisma/client";

export class ShelfReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getAll() {
		return await this.prisma.shelf.findMany({
			include: {
				racks: {
					include: {
						slots: true,
					},
				},
			},
		});
	}

	async existSlotByIds(ids: number[]) {
		const count = await this.prisma.slot.count({
			where: {
				id: { in: ids },
			},
		});
		return count === ids.length;
	}
}