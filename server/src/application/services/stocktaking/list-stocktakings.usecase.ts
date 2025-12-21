import { StocktakingPrismaRepository } from '../../../infrastructure/repositories/prisma/stocktaking.prisma.repository';

export class ListStocktakingsUsecase {
  constructor(private readonly stocktakingRepo: StocktakingPrismaRepository) {}

  async execute() {
    // Lấy tất cả phiếu kiểm kê, bao gồm employee, stocktakingDetails, product, slot, rack, shelf
    return this.stocktakingRepo.findAllWithDetails();
  }
}
