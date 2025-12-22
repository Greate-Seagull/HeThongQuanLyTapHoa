import z from "zod";
import { SlotRepository } from "../../../infrastructure/repositories/slot.repository";
import { RackRepository } from "../../../infrastructure/repositories/rack.repository";
import { logger } from "../../../domain/services/logger.service";
import { SlotDetailUsecase } from './slot-detail.usecase';

const inputSchema = z.object({
  id: z.coerce.number(),
  authId: z.number(),
  name: z.string().min(1).optional(),
  rackId: z.number().optional(),
  productId: z.union([z.number(), z.null()]).optional(),
});

const outputSchema = z.object({
  slotId: z.number(),
});

export class UpdateSlotUsecase {
  constructor(
    private readonly slotRepo: SlotRepository,
    private readonly rackRepo: RackRepository,
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

    console.log('📦 UpdateSlot input:', {
      slotId: parsedInput.id,
      name: parsedInput.name,
      rackId: parsedInput.rackId,
      productId: parsedInput.productId,
    });

    // Verify slot exists
    const slots = await this.slotRepo.getByIds([parsedInput.id]);
    if (slots.length === 0) {
      throw Error(`Slot with id ${parsedInput.id} not found`);
    }
    const slot = slots[0];

    // If rackId is changing, verify new rack exists
    if (parsedInput.rackId && parsedInput.rackId !== slot.rackId) {
      const newRacks = await this.rackRepo.getByIds([parsedInput.rackId]);
      if (newRacks.length === 0) {
        throw Error(`Rack with id ${parsedInput.rackId} not found`);
      }
      console.log(`✅ Moving slot ${slot.id} from rack ${slot.rackId} to rack ${parsedInput.rackId}`);
    }

    // Update slot entity
    slot.update(parsedInput);
    const savedSlot = await this.slotRepo.update(slot);

    // ✅ CRITICAL FIX: Handle productId changes (including removal)
    if (parsedInput.productId !== undefined) {
      if (parsedInput.productId === null || parsedInput.productId === 0 || !parsedInput.productId) {
        // ✅ Remove ALL products from slot (set slot as empty)
        console.log(`🗑️ Removing all products from slot ${savedSlot.id}`);
        await this.slotDetailUsecase.removeAll(savedSlot.id);
      } else {
        // Assign/update product to slot
        console.log(`✅ Assigning product ${parsedInput.productId} to slot ${savedSlot.id}`);
        await this.slotDetailUsecase.update(savedSlot.id, parsedInput.productId);
      }
    }

    log.info("Task completed");
    return outputSchema.parse({ slotId: savedSlot.id });
  }
}
