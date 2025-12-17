import { EmployeeReadAccessor } from "../../../application/services/read-accessors/employee.read-accessor";
import { EmployeeId } from "../../../domain/entities/employee";
import { PrismaReadAccessor } from "./prisma.read-accessor";

export class EmployeePrismaReadAccessor
	extends PrismaReadAccessor
	implements EmployeeReadAccessor
{
	async existById(id: EmployeeId): Promise<boolean> {
		const count = await this.client.employee.count({
			where: { id: id },
		});

		return count === 1;
	}

	async getPositionById(
		employeeId: EmployeeId
	): Promise<{ id: EmployeeId; name: string; position: string }> {
		return await this.client.employee.findUnique({
			where: { id: employeeId },
			select: { id: true, name: true, position: true },
		});
	}

	async getNameById(
		id: EmployeeId
	): Promise<{ id: EmployeeId; name: string }> {
		return await this.client.employee.findUnique({
			where: { id },
			select: { id: true, name: true },
		});
	}
}
