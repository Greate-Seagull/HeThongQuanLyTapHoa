import { EmployeeId } from "../../../domain/entities/employee";

export interface EmployeeReadAccessor {
	existById(id: EmployeeId): Promise<boolean>;
	getPositionById(
		employeeId: EmployeeId
	): Promise<{ id: EmployeeId; name: string; position: string }>;
	getNameById(id: EmployeeId): Promise<{ id: EmployeeId; name: string }>;
}
