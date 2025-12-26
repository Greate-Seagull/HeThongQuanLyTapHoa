import { Prisma } from "@prisma/client";
import { EmployeeAccount } from "../../../domain/entities/employee-account";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { EmployeeAccountRepository } from "../../../application/repositories/employee-account.repository";
import { PrismaRepository } from "./prisma.prisma.repository";
import { EmployeeAccountDto } from "../../../application/DTOs/employee-account.dto";

export class EmployeeAccountPrismaRepository
  extends PrismaRepository<EmployeeAccount, EmployeeAccountDto>
  implements EmployeeAccountRepository
{
  private static baseSelect = buildSafePrismaSelect(EmployeeAccount);

  async getByUsername(username: string): Promise<EmployeeAccount | null> {
    const raw = await this.getRepository().findUnique({
      where: {
        username,
      },
      select: this.getBaseQuery().select,
    });

    return this.fromPersistence(raw);
  }

  protected buildUpdateData(
    entity: EmployeeAccount
  ): Partial<EmployeeAccountDto> {
    return this.toPersistence(entity);
  }

  protected buildCreateData(
    entity: EmployeeAccount
  ): Partial<EmployeeAccountDto> {
    return this.toPersistence(entity);
  }

  protected getBaseQuery(): { select: object } {
    return EmployeeAccountPrismaRepository.baseSelect;
  }

  protected getRepository(transaction?: Prisma.TransactionClient): any {
    if (transaction) return transaction.employeeAccount;
    return this.client.employeeAccount;
  }
  async findByEmployeeId(employeeId: number): Promise<EmployeeAccount | null> {
    const raw = await this.getRepository().findFirst({
      where: {
        employeeId,
      },
      select: this.getBaseQuery().select,
    });
    return this.fromPersistence(raw);
  }
}
