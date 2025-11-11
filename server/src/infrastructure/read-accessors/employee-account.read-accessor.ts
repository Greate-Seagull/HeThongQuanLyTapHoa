import { PrismaClient } from "@prisma/client";

export class EmployeeAccountReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async existByUsername(username: string) {
		const count = await this.prisma.employeeAccount.count({
			where: {
				username: username,
			},
		});

		return count === 1;
	}
}
