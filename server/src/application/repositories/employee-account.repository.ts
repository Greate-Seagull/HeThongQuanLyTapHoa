import { EmployeeAccount } from "../../domain/entities/employee-account";
import { BaseRepository } from "./base.repository";

export interface EmployeeAccountRepository
	extends BaseRepository<EmployeeAccount> {
	getByUsername(username: string): Promise<EmployeeAccount | null>;
	findByEmployeeId(employeeId: number): Promise<EmployeeAccount | null>;
}
