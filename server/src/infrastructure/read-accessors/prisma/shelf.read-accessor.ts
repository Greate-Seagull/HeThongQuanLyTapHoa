import { ShelfReadAccessor } from "../../../application/services/read-accessors/shelf.read-accessor";
import { PrismaReadAccessor } from "./prisma.read-accessor";

export class ShelfPrismaReadAccessor
	extends PrismaReadAccessor
	implements ShelfReadAccessor
{
	async existSlotByIds(ids: number[]): Promise<boolean> {
		const count = await this.client.slot.count({
			where: { id: { in: ids } },
		});

		return count === ids.length;
	}

	async getShelvesWithRacksAndSlots(): Promise<any[]> {
		return this.client.shelf.findMany({
			include: {
				racks: {
					include: {
						slots: true,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		});
	}
}
