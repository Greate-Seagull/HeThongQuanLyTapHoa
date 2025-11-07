import { PrismaClient } from "@prisma/client";
import { EmployeeMapper } from "../mappers/employee.mapper";

export class EmployeeRepository implements EmployeeRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getById(employeedId: number) {
		const raw = await this.prisma.employee.findUnique({
			where: { id: employeedId },
			select: EmployeeRepository.baseQuery,
		});

		return EmployeeMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		name: true,
	};
}
