import { Employee } from "../../domain/employee";

export class EmployeeMapper {
	static toPersistence(employee: Employee) {
		return {
			name: employee.name,
			position: employee.position,
		};
	}
	static toDomain(raw: any) {
		if (!raw) return raw;
		return Employee.rehydrate(raw);
	}
}
