import z from "zod";
import { EmployeeAccountRepository } from "../../infrastructure/repositories/employee-account.repository";
import { EmployeeAccountReadAccessor } from "../../infrastructure/read-accessors/employee-account.read-accessor";
import { logger } from "../../domain/services/logger.service";
import { EmployeeRepository } from "../../infrastructure/repositories/employee.repository";
import { EmployeeReadAccess } from "../../infrastructure/read-accessors/employee.read-accessor";

const inputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  username: z.string().optional(),
  position: z.string().optional(),
});

const outputSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  position: z.string(),
});

type UpdateEmployeeAccountOutput = z.infer<typeof outputSchema>;

export class UpdateEmployeeAccountUsecase {
  constructor(
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeAccountRead: EmployeeAccountReadAccessor,
    private readonly employeeRepo: EmployeeRepository,
    private readonly employeeRead: EmployeeReadAccess
  ) {}

  async execute(input: any): Promise<UpdateEmployeeAccountOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Update employee account",
      id: parsedInput.id,
    });
    log.info("Task started");

    const account = await this.employeeAccountRepo.getById(parsedInput.id);
    if (!account) throw Error("Employee account not found");

    // Cập nhật username nếu có
    if (parsedInput.username !== undefined) account.username = parsedInput.username;
    const savedAccount = await this.employeeAccountRepo.save(null, account);

    // Cập nhật name/position cho employee nếu có
    let employee = null;
    if (parsedInput.name !== undefined || parsedInput.position !== undefined) {
      employee = await this.employeeRepo.getById(account.employeeId);
      if (!employee) throw Error("Employee not found");
      if (parsedInput.name !== undefined) employee.name = parsedInput.name;
      if (parsedInput.position !== undefined) employee.position = parsedInput.position;
      await this.employeeRepo.updateById(null, employee); // dùng update thay vì add
    } else {
      employee = await this.employeeRead.getPositionById(account.employeeId);
    }

    log.info("Task completed");
    return outputSchema.parse({
      id: savedAccount.id,
      name: employee.name,
      username: savedAccount.username,
      position: employee.position,
    });
  }
}
