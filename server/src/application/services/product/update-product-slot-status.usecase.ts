import { z } from "zod";
import { PrismaClient, ProductStatus } from "../../../generated/client";

const inputSchema = z.object({
  productId: z.coerce.number(),
  status: z.nativeEnum(ProductStatus),
});

export class UpdateProductStatusUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: any) {
    const { productId, status } = inputSchema.parse(input);

    await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: status,
      },
    });

    return {
      success: true,
      message: "Cập nhật trạng thái sản phẩm thành công",
    };
  }
}
