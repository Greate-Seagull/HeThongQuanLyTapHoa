import { StocktakingPrismaRepository } from '../../../infrastructure/repositories/prisma/stocktaking.prisma.repository';

export class GetStocktakingByIdUsecase {
  constructor(private readonly stocktakingRepo: StocktakingPrismaRepository) {}

  async execute(input: { id: number }) {
    return this.stocktakingRepo.findByIdWithDetails(input.id);
  }
}
