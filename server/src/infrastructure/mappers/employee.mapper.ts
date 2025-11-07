import { Employee } from "../../domain/employee";

export class EmployeeMapper {
	static toDomain(raw: any) {
		return Employee.rehydrate(raw);
	}
}
