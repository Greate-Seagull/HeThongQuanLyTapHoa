import { prisma } from "./../../../composition-root";
import z from "zod";
import { ProductPrismaReadAccessor } from "../../../infrastructure/read-accessors/prisma/product.read-accessor";
import { PromotionRepository } from "../../repositories/promotion.repository";
import { logger } from "../../../domain/services/logger.service";

const inputSchema = z.object({
  id: z.coerce.number(),
  authId: z.number(),
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  startedAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endedAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  condition: z.string().optional().nullable(),
  value: z.number().optional(),
  promotionType: z.string().optional(),
  promotionDetails: z
    .array(
      z.object({
        productId: z.number(),
      })
    )
    .optional()
    .nullable(),
});

const outputSchema = z.object({
  promotionId: z.number(),
});

export class UpdatePromotionUsecase {
  constructor(
    private readonly productReadAccessor: ProductPrismaReadAccessor,
    private readonly promotionRepo: PromotionRepository
  ) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Updating promotion",
      employeeId: parsedInput.authId,
      promotionId: parsedInput.id,
    });
    log.info("Task started");

    const promotions = await this.promotionRepo.getByIds([parsedInput.id]);
    if (promotions.length === 0) {
      throw Error(`Promotion with id ${parsedInput.id} not found`);
    }
    const promotion = promotions[0];

    const details = parsedInput.promotionDetails;
    if (details && details.length > 0) {
      const productIds = details.map((p) => p.productId);
      const doExist = await this.productReadAccessor.existByIds(productIds);
      if (!doExist) {
        throw Error(`Expect all products to be exist`);
      }
    }

    promotion.update(parsedInput);

    const savedPromotion = await this.promotionRepo.update(promotion);

    log.debug("Task updated", {
      promotionId: savedPromotion.id,
    });

    log.info("Task completed");
    return outputSchema.parse({ promotionId: savedPromotion.id });
  }
}
