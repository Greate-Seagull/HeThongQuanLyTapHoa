import { prisma } from "./../../../composition-root";
import { logger } from "../../../domain/services/logger.service";
import { EmployeeAccountRepository } from "../../repositories/employee-account.repository";
import { EmployeeRepository } from "../../repositories/employee.repository";
import { EmployeeReadAccess } from "../../../infrastructure/read-accessors/prisma/employee.read-accessor";
import z from "zod";

const inputSchema = z.object({
  id: z.number(), // id của employee-account
});

const outputSchema = z.object({
  id: z.number(),           // ✅ EmployeeId (NOT EmployeeAccountId)
  username: z.string(),
  name: z.string(),
  position: z.string(),
});

type EmployeeAccountProfileOutput = z.infer<typeof outputSchema>;

export class GetEmployeeAccountProfileUsecase {
  constructor(
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly employeeRead: EmployeeReadAccess
  ) {}

  async execute(input: any): Promise<EmployeeAccountProfileOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Get employee account profile",
      accountId: parsedInput.id,
    });
    log.info("Task started");

    const account = await this.employeeAccountRepo.getById(parsedInput.id);
    if (!account) throw Error("Employee account not found");
    
    // Lấy thông tin employee
    let employee = await this.employeeRepo.getById(account.employeeId);
    if (!employee) {
      // fallback nếu không có, thử lấy qua read accessor
      employee = await this.employeeRead.getPositionById(account.employeeId);
      if (!employee) throw Error("Employee not found");
    }

    log.info("Task completed", {
      accountId: parsedInput.id,
      employeeId: employee.id,
    });
    
    // ✅ FIX: Return EmployeeId, NOT EmployeeAccountId
    return outputSchema.parse({
      id: employee.id,         // ✅ EmployeeId (121)
      username: account.username,
      name: employee.name,
      position: employee.position,
    });
  }
}
