import { InvoicePrismaRepository } from '../../../infrastructure/repositories/prisma/invoice.prisma.repository';

export class GetInvoiceByIdUsecase {
  constructor(private readonly invoiceRepo: InvoicePrismaRepository) {}

  async execute(input: { id: number }) {
    return this.invoiceRepo.findByIdWithDetails(input.id);
  }
}
