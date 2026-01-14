import { Dto, EntitySchema } from "../../../application/DTOs/base.dto";
import { BaseEntity, Id } from "../../../domain/abstracts/entity";
import {
  fromPersistence,
  toSnapshot,
} from "../../../domain/services/mapper.service";
import { Prisma, PrismaClient } from "../../../generated/client";
import { ChangeTracker } from "../../cache/change-tracker";

export abstract class PrismaRepository<
  EntityType extends BaseEntity<Id>,
  DtoType extends Dto<EntityType>
> {
  protected readonly tracker = new ChangeTracker<DtoType>();

  public constructor(
    protected readonly client: PrismaClient,
    protected readonly schema: EntitySchema<EntityType, DtoType>
  ) {}

  public async getById(
    id: Id,
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType | null> {
    const raw = await this.getRepository(transaction).findUnique({
      where: { id },
      select: this.getBaseQuery().select,
    });

    return this.buildEntity(raw);
  }

  public async getByIds(
    ids: Id[],
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType[] | null> {
    const raws = await this.getRepository(transaction).findMany({
      where: { id: { in: ids } },
      select: this.getBaseQuery().select,
    });
    console.debug("[getByIds] Prisma raws:", JSON.stringify(raws));
    const entities = raws.map((raw: any) => this.buildEntity(raw));
    console.debug("[getByIds] Entities:", JSON.stringify(entities));
    return entities;
  }

  public async add(
    entity: EntityType,
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType> {
    const raw = await this.getRepository(transaction).create({
      data: this.buildCreateData(entity),
      select: this.getBaseQuery().select,
    });

    return this.buildEntity(raw);
  }

  public async addMany(
    entities: EntityType[],
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType[]> {
    const raws = await this.getRepository(transaction).createMany({
      data: entities.map((entity) => this.buildCreateData(entity)),
    });

    // Prisma does not return created entities
    return [];
  }

  public async save(
    entity: EntityType,
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType> {
    const raw = await this.getRepository(transaction).update({
      where: { id: entity.id },
      data: this.buildUpdateData(entity),
      select: this.getBaseQuery().select,
    });

    return this.buildEntity(raw);
  }

  public async saveMany(
    entities: EntityType[],
    transaction?: Prisma.TransactionClient
  ): Promise<EntityType[]> {
    const raws = await Promise.all(
      entities.map((entity) =>
        this.getRepository(transaction).update({
          where: { id: entity.id },
          data: this.buildUpdateData(entity),
          select: this.getBaseQuery().select,
        })
      )
    );

    return raws.map((raw) => this.buildEntity(raw));
  }

  protected abstract buildUpdateData(entity: EntityType): Partial<DtoType>;

  protected abstract buildCreateData(entity: EntityType): Partial<DtoType>;

  protected abstract getBaseQuery(): { select: object };

  protected abstract getRepository(transaction?: Prisma.TransactionClient): any;

  protected buildEntity(raw: any): EntityType | null {
    if (!raw) return null;
    const entity = this.fromPersistence(raw);
    return entity;
  }

  protected toPersistence(entity: EntityType): Partial<DtoType> {
    const writables = toSnapshot(entity);
    const dto = this.schema.schema.parse(writables);
    return this.tracker.diff(entity.id, dto);
  }

  protected fromPersistence(raw: any): EntityType {
    if (!raw) return null;

    const dto = this.schema.schema.parse(raw);
    const entity = fromPersistence(this.schema.constructor, dto);
    this.tracker.track(entity.id, dto);
    return entity;
  }
}
