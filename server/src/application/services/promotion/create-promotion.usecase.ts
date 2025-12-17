import z from "zod";
import { Promotion } from "../../../domain/entities/promotion";
import { logger } from "../../../domain/services/logger.service";
import { PromotionRepository } from "../../repositories/promotion.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

const inputSchema = z.object({
  authId: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  startedAt: z.string().transform((val) => new Date(val)),
  endedAt: z.string().transform((val) => new Date(val)),
  value: z.number(),
  promotionType: z.string(),
  promotionDetails: z.array(z.object({ productId: z.number() })).optional().default([]),
});

const outputSchema = z.object({
  promotionId: z.number(),
});

type CreatePromotionOutput = z.infer<typeof outputSchema>;

export class CreatePromotionUsecase {
  constructor(
    private readonly productReadAccessor: ProductReadAccessor,
    private readonly promotionRepo: PromotionRepository
  ) {}

  async execute(input: any): Promise<CreatePromotionOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Creating promotion",
      employeeId: parsedInput.authId,
    });
    log.info("Task started");

    const promotionDetails = parsedInput.promotionDetails || [];
    const productIds = promotionDetails.map((d) => d.productId);
    const doExist = await this.productReadAccessor.existByIds(productIds);
    if (!doExist) {
      log.warn("Task failed: invalid product id");
      throw Error(`Expect all products to be exist`);
    }
    log.debug("Task validated", {
      productIds: productIds,
    });

    const promotion = Promotion.create(
      parsedInput.name,
      parsedInput.startedAt,
      parsedInput.endedAt,
      parsedInput.value,
      parsedInput.promotionType,
      productIds,
      parsedInput.description
    );

    const savedPromotion = await this.promotionRepo.add(promotion);
    log.debug("Task saved", {
      promotionId: savedPromotion.id,
    });

    log.info("Task completed");
    return outputSchema.parse({ promotionId: savedPromotion.id });
  }
}
