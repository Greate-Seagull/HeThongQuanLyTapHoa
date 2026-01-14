import z from "zod";
import { EmployeeAccountRepository } from "../../repositories/employee-account.repository";
import { EmployeeRepository } from "../../repositories/employee.repository";
import { EmployeeReadAccess } from "../../../infrastructure/read-accessors/prisma/employee.read-accessor";
import { EmployeeAccountReadAccessor } from "../read-accessors/employee-account.read-accessor";
import { logger } from "../../../domain/services/logger.service";
const inputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  username: z.string().optional(),
  position: z.string().optional(),
  avatar: z.string().optional(),
});

const outputSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  position: z.string(),
  avatar: z.string().nullable().optional().default(null), // ✅ Default to null
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
    if (parsedInput.username !== undefined)
      account.updateUsername(parsedInput.username);
    const savedAccount = await this.employeeAccountRepo.save(account);

    // Cập nhật name/position cho employee nếu có
    let employee = null;
    if (parsedInput.name !== undefined || parsedInput.position !== undefined || parsedInput.avatar !== undefined) {
      employee = await this.employeeRepo.getById(account.employeeId);
      if (!employee) throw Error("Employee not found");
      employee.update(parsedInput.name, parsedInput.position, parsedInput.avatar);
      await this.employeeRepo.save(employee);
    } else {
      employee = await this.employeeRead.getPositionById(account.employeeId);
    }

    log.info("Task completed");
    const result = {
      id: savedAccount.id,
      name: employee.name,
      username: savedAccount.username,
      position: employee.position,
      avatar: employee.avatar || null,
    };
    return outputSchema.parse(result);
  }
}
