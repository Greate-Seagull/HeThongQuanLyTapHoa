import { PrismaClient } from "@prisma/client";

export class EmployeeReadAccess {
	constructor(private readonly prisma: PrismaClient) {}

	async existById(id: number): Promise<boolean> {
		const count = await this.prisma.employee.count({
			where: { id: id },
		});

		return count === 1;
	}

	async getById(id: number): Promise<{ id: number; name: string; position: string } | null> {
		return await this.prisma.employee.findUnique({
			where: { id },
			select: { id: true, name: true, position: true },
		});
	}

	async getPositionById(employeeId: number) {
		return await this.prisma.employee.findUnique({
			where: { id: employeeId },
			select: { id: true, name: true, position: true },
		});
	}

	async getNameById(id: number): Promise<{ id: number; name: string }> {
		return await this.prisma.employee.findUnique({
			where: { id },
			select: { id: true, name: true },
		});
	}
}
