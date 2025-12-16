import { EmployeeAccountReadAccessor } from "../../infrastructure/read-accessors/employee-account.read-accessor";
import { logger } from "../../domain/services/logger.service";

export class GetEmployeeAccountsUsecase {
  constructor(
    private readonly employeeAccountRead: EmployeeAccountReadAccessor
  ) {}

  async execute(): Promise<any[]> {
    const log = logger.child({ task: "Get all employee accounts" });
    log.info("Task started");
    const accounts = await this.employeeAccountRead.getAll();
    log.info("Task completed");
    return accounts.map((acc) => ({
      id: acc.id,
      username: acc.username,
      employee: acc.employee,
    }));
  }
}
