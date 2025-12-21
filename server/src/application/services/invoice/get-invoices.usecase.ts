import { InvoicePrismaRepository } from '../../../infrastructure/repositories/prisma/invoice.prisma.repository';

export class GetInvoicesUsecase {
  constructor(private readonly invoiceRepo: InvoicePrismaRepository) {}

  async execute() {
    // Lấy tất cả hóa đơn, bao gồm chi tiết, nhân viên, khách hàng, khuyến mãi
    return this.invoiceRepo.findAllWithDetails();
  }
}
