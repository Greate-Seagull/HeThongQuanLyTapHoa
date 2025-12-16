export interface EmployeeAccountReadAccessor {
	existByUsername(username: string): Promise<boolean>;
}
