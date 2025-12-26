import { Prisma, PrismaClient } from "@prisma/client";
import { EmployeeAccount } from "../../domain/entities/employee-account";
import {
  fromPersistence,
  toPersistenceObject,
} from "../../domain/services/mapper.service";
import { ChangeTracker } from "../cache/change-tracker";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class EmployeeAccountRepository implements EmployeeAccountRepository {
  private tracker = new ChangeTracker<any>();

  constructor(private readonly prisma: PrismaClient) {}

  async add(account: EmployeeAccount, transaction?: Prisma.TransactionClient) {
    const repo = transaction || this.prisma;
    const raw = await repo.employeeAccount.create({
      data: this.tracker.diff(account.id, toPersistenceObject(account)),
      ...EmployeeAccountRepository.baseQuery,
    });

    const savedEntity = fromPersistence(EmployeeAccount, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  async addMany(
    accounts: EmployeeAccount[],
    transaction?: Prisma.TransactionClient
  ) {
    const result: EmployeeAccount[] = [];
    for (const account of accounts) {
      result.push(await this.add(account, transaction));
    }
    return result;
  }

  async getByUsername(username: string) {
    const raw = await this.prisma.employeeAccount.findUnique({
      where: {
        username,
      },
      ...EmployeeAccountRepository.baseQuery,
    });

    if (!raw) return null;

    const savedEntity = fromPersistence(EmployeeAccount, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  async save(account: EmployeeAccount, transaction?: Prisma.TransactionClient) {
    const repo = transaction || this.prisma;
    const raw = await repo.employeeAccount.update({
      where: { id: account.id },
      data: this.tracker.diff(account.id, toPersistenceObject(account)),
      ...EmployeeAccountRepository.baseQuery,
    });

    const savedEntity = fromPersistence(EmployeeAccount, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  async saveMany(
    accounts: EmployeeAccount[],
    transaction?: Prisma.TransactionClient
  ) {
    const result: EmployeeAccount[] = [];
    for (const account of accounts) {
      result.push(await this.save(account, transaction));
    }
    return result;
  }

  async getAll() {
    const raws = await this.prisma.employeeAccount.findMany({
      ...EmployeeAccountRepository.baseQuery,
    });
    return raws.map((raw) => {
      const entity = fromPersistence(EmployeeAccount, raw);
      this.tracker.track(entity.id, raw);
      return entity;
    });
  }

  async getById(id: number, transaction?: Prisma.TransactionClient) {
    const repo = transaction || this.prisma;
    const raw = await repo.employeeAccount.findUnique({
      where: { id },
      ...EmployeeAccountRepository.baseQuery,
    });
    if (!raw) return null;

    const savedEntity = fromPersistence(EmployeeAccount, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  async getByIds(ids: number[], transaction?: Prisma.TransactionClient) {
    const repo = transaction || this.prisma;
    const raws = await repo.employeeAccount.findMany({
      where: { id: { in: ids } },
      ...EmployeeAccountRepository.baseQuery,
    });
    return raws.map((raw) => {
      const entity = fromPersistence(EmployeeAccount, raw);
      this.tracker.track(entity.id, raw);
      return entity;
    });
  }
  async findByEmployeeId(employeeId: number): Promise<EmployeeAccount | null> {
    const raw = await this.prisma.employeeAccount.findFirst({
      where: {
        employeeId,
      },
      ...EmployeeAccountRepository.baseQuery,
    });
    if (!raw) return null;
    const savedEntity = fromPersistence(EmployeeAccount, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  static baseQuery = buildSafePrismaSelect(EmployeeAccount);
}
