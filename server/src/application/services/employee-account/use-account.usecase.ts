import {
  PasswordService,
  TokenService,
} from "../../../domain/services/encrypt.service";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";
import { EmployeeAccountRepository } from "../../../infrastructure/repositories/employee-account.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const outputSchema = z.object({
  token: z.string(),
  employee: z.object({
    id: z.number(),           // ✅ EmployeeAccount.id (not Employee.id)
    employeeId: z.number(),   // ✅ Real Employee.id
    username: z.string(),
    name: z.string(),
    position: z.string(),
  }),
});

type UseAccountOutput = z.infer<typeof outputSchema>;

export class UseAccountUsecase {
  constructor(
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeRead: EmployeeReadAccessor,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: any): Promise<UseAccountOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Signing in employee account",
      username: parsedInput.username,
    });
    log.info("Task started");

    // ✅ STEP 1: Find account by username
    const account = await this.employeeAccountRepo.getByUsername(
      parsedInput.username
    );
    
    if (!account) {
      log.warn("Task failed: invalid username");
      throw Error(`Invalid username or password`);
    }
    
    console.log('✅ Found account:', {
      id: account.id,
      employeeId: account.employeeId,
      username: account.username,
    });

    // ✅ STEP 2: Validate password
    console.log('🔍 Validating password...');
    const isPasswordValid = this.passwordService.comparePassword(
      parsedInput.password,  // ✅ Use parsedInput (not input)
      account.passwordHash
    );
    
    if (!isPasswordValid) {
      log.warn("Task failed: invalid password");
      throw Error(`Invalid username or password`);
    }
    
    console.log('✅ Password validated');

    // ✅ STEP 3: Get employee details
    const employee = await this.employeeRead.getPositionById(
      account.employeeId
    );
    
    if (!employee) {
      log.error("Task failed: employee not found");
      throw Error(`Employee data not found`);
    }
    
    console.log('✅ Employee found:', {
      employeeId: employee.id,
      name: employee.name,
      position: employee.position,
    });

    // ✅ STEP 4: Update logged in timestamp
    account.signIn();
    const savedAccount = await this.employeeAccountRepo.save(account);
    
    console.log('✅ Account logged in timestamp updated');

    // ✅ STEP 5: Generate JWT token
    const token = this.tokenService.generateJwt({
      id: account.id,        // ✅ EmployeeAccount.id (for authentication)
      position: employee.position,
    });
    
    console.log('✅ Token generated');

    log.info("Task completed");
    
    return outputSchema.parse({
      token,
      employee: {
        id: savedAccount.id,           // ✅ EmployeeAccount.id
        employeeId: employee.id,       // ✅ Real Employee.id
        username: savedAccount.username,
        name: employee.name,
        position: employee.position,
      },
    });
  }
}
