import { Employee } from "../../domain/employee";

export class EmployeeMapper {
	static toDomain(raw: any) {
		if (!raw) return raw;
		return Employee.rehydrate(raw);
	}
}
