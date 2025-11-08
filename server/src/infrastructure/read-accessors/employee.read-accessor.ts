import { PrismaClient } from "@prisma/client";

export class EmployeeReadAccess {
	constructor(private readonly prisma: PrismaClient) {}

	async existById(id: number): Promise<boolean> {
		const count = await this.prisma.employee.count({
			where: { id: id },
		});

		return count === 1;
	}
}
