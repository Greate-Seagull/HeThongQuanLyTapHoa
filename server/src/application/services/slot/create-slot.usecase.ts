import z from "zod";
import { Slot } from "../../../domain/entities/slot";
import { SlotRepository } from "../../../infrastructure/repositories/slot.repository";
import { RackRepository } from "../../../infrastructure/repositories/rack.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
  authId: z.number(),
  name: z.string().min(1),
  rackId: z.number(),
  productId: z.number().optional(),
  quantity: z.number().optional(), // Thêm quantity field
});

const outputSchema = z.object({
  slotId: z.number(),
});

import { SlotDetailUsecase } from './slot-detail.usecase';
export class CreateSlotUsecase {
  constructor(
    private readonly slotRepo: SlotRepository,
    private readonly rackRepo: RackRepository,
    private readonly slotDetailUsecase: SlotDetailUsecase
  ) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Creating slot",
      employeeId: parsedInput.authId,
    });
    log.info("Task started");

    // Validate Rack exists
    const racks = await this.rackRepo.getByIds([parsedInput.rackId]);
    if (racks.length === 0) {
      throw Error(`Rack with id ${parsedInput.rackId} not found`);
    }

    const slot = Slot.create(parsedInput);
    const savedSlot = await this.slotRepo.add(slot);

    // Nếu có productId thì lưu SlotDetail với quantity
    if (parsedInput.productId) {
      const quantity = parsedInput.quantity ?? 0; // Default to 0 if not provided
      await this.slotDetailUsecase.add(savedSlot.id, parsedInput.productId, quantity);
    }

    log.info("Task completed");
    return outputSchema.parse({ slotId: savedSlot.id });
  }
}
