import { EmployeeAccountReadAccessor } from "../../../application/services/read-accessors/employee-account.read-accessor";
import { PrismaReadAccessor } from "./prisma.read-accessor";

export class EmployeeAccountPrismaReadAccessor
	extends PrismaReadAccessor
	implements EmployeeAccountReadAccessor
{
	async existByUsername(username: string): Promise<boolean> {
		const count = await this.client.employeeAccount.count({
			where: {
				username,
			},
		});

		return count === 1;
	}
}
