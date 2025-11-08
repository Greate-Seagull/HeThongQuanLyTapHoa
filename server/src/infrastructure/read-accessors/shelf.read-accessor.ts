import { PrismaClient } from "@prisma/client";

export class ShelfReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async existSlotByIds(ids: number[]): Promise<boolean> {
		const count = await this.prisma.slot.count({
			where: { id: { in: ids } },
		});

		return count === ids.length;
	}
}
