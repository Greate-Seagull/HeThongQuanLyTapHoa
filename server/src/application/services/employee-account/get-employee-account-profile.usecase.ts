import { prisma } from "./../../../composition-root";
import { logger } from "../../../domain/services/logger.service";
import { EmployeeAccountRepository } from "../../../infrastructure/repositories/employee-account.repository";
import { EmployeeRepository } from "../../../application/repositories/employee.repository";
import { EmployeeReadAccess } from "../../../infrastructure/read-accessors/prisma/employee.read-accessor";
import z from "zod";

const inputSchema = z.object({
  id: z.number(), // ✅ This is EmployeeAccount.id (not Employee.id)
});

const outputSchema = z.object({
  id: z.number(),           // ✅ EmployeeAccount.id
  employeeId: z.number(),   // ✅ Employee.id (for reference)
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
      accountId: parsedInput.id, // EmployeeAccount.id
    });
    log.info("Task started");

    // ✅ Get EmployeeAccount by ID
    const account = await this.employeeAccountRepo.getById(parsedInput.id);
    if (!account) {
      log.warn("Employee account not found");
      throw Error("Employee account not found");
    }
    
    console.log('✅ Found employee account:', {
      accountId: account.id,
      employeeId: account.employeeId,
      username: account.username,
    });
    
    // ✅ Get Employee info by employeeId
    const employee = await this.employeeRead.getById(account.employeeId);
    if (!employee) {
      log.warn("Employee not found");
      throw Error("Employee not found");
    }
    
    console.log('✅ Found employee:', {
      employeeId: employee.id,
      name: employee.name,
      position: employee.position,
    });

    log.info("Task completed", {
      accountId: account.id,
      employeeId: employee.id,
    });
    
    return outputSchema.parse({
      id: account.id,           // EmployeeAccount.id
      employeeId: employee.id,  // Employee.id
      username: account.username,
      name: employee.name,
      position: employee.position,
    });
  }
}
