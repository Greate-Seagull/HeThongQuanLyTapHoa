import { Employee } from "../../../domain/entities/employee";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { EmployeeRepository } from "../../../application/repositories/employee.repository";
import { PrismaRepository } from "./prisma.prisma.repository";
import { EmployeeDto } from "../../../application/DTOs/employee.dto";
import { Prisma } from "../../../generated/client";

export class EmployeePrismaRepository
	extends PrismaRepository<Employee, EmployeeDto>
	implements EmployeeRepository
{
	private static baseSelect = buildSafePrismaSelect(Employee);

	protected buildUpdateData(entity: Employee): Partial<EmployeeDto> {
		return this.toPersistence(entity);
	}

	protected buildCreateData(entity: Employee): Partial<EmployeeDto> {
		return this.toPersistence(entity);
	}

	protected getBaseQuery(): { select: object } {
		return EmployeePrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.employee;
		return this.client.employee;
	}
}
