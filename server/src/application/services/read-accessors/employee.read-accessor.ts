import { EmployeeId } from "../../../domain/entities/employee";

export interface EmployeeReadAccessor {
	existById(id: EmployeeId): Promise<boolean>;
	getById(id: EmployeeId): Promise<{ id: EmployeeId; name: string; position: string } | null>;
	getPositionById(
		employeeId: EmployeeId
	): Promise<{ id: EmployeeId; name: string; position: string }>;
	getNameById(id: EmployeeId): Promise<{ id: EmployeeId; name: string }>;
}
