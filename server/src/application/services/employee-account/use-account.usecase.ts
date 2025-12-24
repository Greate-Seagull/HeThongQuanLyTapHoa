import {
  PasswordService,
  TokenService,
} from "../../../domain/services/encrypt.service";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";
import { EmployeeAccountRepository } from "../../repositories/employee-account.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const outputSchema = z.object({
  token: z.string(),
  employee: z.object({
    id: z.number(),
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

    const account = await this.employeeAccountRepo.getByUsername(
      parsedInput.username
    );
    if (!account) {
      log.warn("Task failed: invalid username");
      throw Error(`Invalid username or password`);
    }

    const isPasswordValid = this.passwordService.comparePassword(
      input.password,
      account.passwordHash
    );
    if (!isPasswordValid) {
      log.warn("Task failed: invalid password");
      throw Error(`Invalid username or password`);
    }
    log.debug("Task validated");

    const employee = await this.employeeRead.getPositionById(
      account.employeeId
    );
    log.debug("Task loaded", {
      employeeId: employee.id,
    });

    account.signIn();
    const savedAccount = await this.employeeAccountRepo.save(account);
    log.debug("Task saved", {
      accountId: savedAccount.id,
    });

    const token = this.tokenService.generateJwt({
      id: account.employeeId,
      position: employee.position,
    });

    log.info("Task completed");
    return outputSchema.parse({
      token,
      employee: {
        username: savedAccount.username,
        ...employee,
      },
    });
  }
}
