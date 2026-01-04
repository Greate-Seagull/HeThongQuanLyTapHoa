import { PrismaClient } from "@prisma/client";
import { Slot, SlotId } from "../../domain/entities/slot";
import { ChangeTracker } from "../cache/change-tracker";
import {
  fromPersistence,
  toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class SlotRepository {
  private tracker = new ChangeTracker<any>();

  constructor(private readonly prisma: PrismaClient) {}

  async add(slot: Slot): Promise<Slot> {
    const data = toPersistenceObject(slot);
    const raw = await this.prisma.slot.create({
      data: this.tracker.diff(slot.id, data),
      ...SlotRepository.baseQuery,
    });
    const entity = fromPersistence(Slot, raw);
    this.tracker.track(entity.id, raw);
    return entity;
  }

  async update(slot: Slot): Promise<Slot> {
    const data = toPersistenceObject(slot);
    const diff = this.tracker.diff(slot.id, data);

    console.log("🔵 Slot ID:", slot.id);
    console.log("🔵 Data to update:", data);
    console.log("🔵 Diff from tracker:", diff); // <-- THÊM DÒNG NÀY
    const raw = await this.prisma.slot.update({
      where: { id: slot.id },
      data: this.tracker.diff(slot.id, data),
      ...SlotRepository.baseQuery,
    });
    const entity = fromPersistence(Slot, raw);
    this.tracker.track(entity.id, raw);
    return entity;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.slot.delete({ where: { id } });
  }

  async getByIds(ids: SlotId[]): Promise<Slot[]> {
    const raws = await this.prisma.slot.findMany({
      // Nếu bạn muốn lấy theo IDs, hãy bỏ comment dòng dưới
      // where: { id: { in: ids } },
      include: {
        rack: {
          include: {
            shelf: true, // Lấy luôn thông tin Kệ (Shelf)
          },
        },
        slotDetails: {
          include: {
            product: true, // Lấy luôn thông tin Sản phẩm (Product)
          },
        },
      },
    });

    const entities: Slot[] = [];
    for (const raw of raws) {
      // QUAN TRỌNG: Kiểm tra hàm fromPersistence
      // Nếu hàm này không tự map Object, bạn phải gán thủ công hoặc sửa hàm đó
      const entity = fromPersistence(Slot, raw);

      // Nếu entity sau khi map bị mất rack, hãy gán tạm như sau:
      (entity as any).rack = raw.rack;

      this.tracker.track(entity.id, raw);
      entities.push(entity);
    }
    return entities;
  }
  async getById(id: SlotId): Promise<Slot | null> {
    const raw = await this.prisma.slot.findUnique({
      where: { id },
      include: {
        rack: {
          include: {
            shelf: true,
          },
        },
      },
    });

    if (!raw) return null;

    const entity = fromPersistence(Slot, raw);
    (entity as any).rack = raw.rack;
    this.tracker.track(entity.id, raw);

    return entity;
  }
  static baseQuery = buildSafePrismaSelect(Slot);
}
