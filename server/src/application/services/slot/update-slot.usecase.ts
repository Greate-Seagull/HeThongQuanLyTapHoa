import z from "zod";
import { SlotRepository } from "../../../infrastructure/repositories/slot.repository";
import { logger } from "../../../domain/services/logger.service";
import { SlotDetailUsecase } from "./slot-detail.usecase";

const inputSchema = z.object({
  id: z.coerce.number(),
  authId: z.number(),
  name: z.string().min(1).optional(),
  rackId: z.number().optional(),
  productId: z.number().optional(),
  quantity: z.number().optional(), // Thêm quantity field
});

const outputSchema = z.object({
  slotId: z.number(),
});

export class UpdateSlotUsecase {
  constructor(
    private readonly slotRepo: SlotRepository,
    private readonly slotDetailUsecase: SlotDetailUsecase
  ) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Updating slot",
      employeeId: parsedInput.authId,
      slotId: parsedInput.id,
    });
    log.info("Task started");

    const slot = await this.slotRepo.getById(parsedInput.id);
    if (!slot) {
      throw Error(`Slot with id ${parsedInput.id} not found`);
    }
    console.log("slotsdata", slot);
    console.log("parsedInput:", parsedInput);

    slot.update(parsedInput);
    await this.slotRepo.update(slot);
    console.log("Slot with id", slot.id, "after update:", slot);

    if (parsedInput.productId !== undefined && parsedInput.productId !== null) {
      // Có productId hợp lệ → Cập nhật SlotDetail với quantity
      const quantity = parsedInput.quantity ?? undefined; // Use provided quantity or undefined to keep existing
      await this.slotDetailUsecase.update(
        parsedInput.id,
        parsedInput.productId,
        quantity
      );
    } else {
      // KHÔNG có productId hoặc productId = null → Xóa
      await this.slotDetailUsecase.deleteBySlotId(parsedInput.id);
    }
    // Không truyền productId → Giữ nguyên, không làm gì

    log.info("Task completed");
    return outputSchema.parse({ slotId: parsedInput.id });
  }
}
