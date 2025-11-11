import { PrismaClient } from "@prisma/client";
import { EmployeeMapper } from "../mappers/employee.mapper";
import { Employee } from "../../domain/employee";

export class EmployeeRepository implements EmployeeRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getById(employeedId: number) {
		const raw = await this.prisma.employee.findUnique({
			where: { id: employeedId },
			select: EmployeeRepository.baseQuery,
		});

		return EmployeeMapper.toDomain(raw);
	}

	async add(tx: any, employee: Employee) {
		const repo = tx ? tx : this.prisma;
		const raw = await repo.employee.create({
			data: EmployeeMapper.toPersistence(employee),
			select: EmployeeRepository.baseQuery,
		});

		return EmployeeMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		name: true,
		position: true,
	};
}
