import { Prisma } from "@prisma/client";
import { Invoice } from "../../../domain/entities/invoice";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { InvoiceDto } from "../../../application/DTOs/invoice.dto";
import { InvoiceRepository } from "../../../application/repositories/invoice.repository";

export class InvoicePrismaRepository
  extends PrismaRepository<Invoice, InvoiceDto>
  implements InvoiceRepository
{
  private static baseSelect = buildSafePrismaSelect(Invoice);

  protected buildUpdateData(entity: Invoice): Partial<InvoiceDto> {
    let persitence = this.toPersistence(entity) as any;
    persitence.invoiceDetails = {
      connect: persitence.invoiceDetails,
    };
    return persitence;
  }

  protected buildCreateData(entity: Invoice): Partial<InvoiceDto> {
    let persitence = this.toPersistence(entity) as any;
    persitence.invoiceDetails = {
      create: persitence.invoiceDetails,
    };
    return persitence;
  }

  protected getBaseQuery(): { select: object } {
    return InvoicePrismaRepository.baseSelect;
  }

  protected getRepository(transaction?: Prisma.TransactionClient): any {
    if (transaction) return transaction.invoice;
    return this.client.invoice;
  }

  // Lấy tất cả hóa đơn kèm chi tiết, nhân viên, khách hàng, khuyến mãi
  async findAllWithDetails() {
    return this.client.invoice.findMany({
      include: {
        employee: true,
        user: true,
        invoiceDetails: {
          include: {
            product: true,
            promotion: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  // Lấy chi tiết hóa đơn theo id, bao gồm chi tiết, nhân viên, user, khuyến mãi
  async findByIdWithDetails(id: number) {
    return this.client.invoice.findUnique({
      where: { id },
      include: {
        employee: true, // Lấy thông tin nhân viên lập hóa đơn
        user: {
          include: {
            accounts: {
              // Tên trong schema là 'accounts' (số nhiều)
              select: {
                phoneNumber: true, // Lấy số điện thoại từ bảng Account
              },
              take: 1, // Thường lấy cái đầu tiên nếu User chỉ có 1 số chính
            },
          },
        },
        invoiceDetails: {
          include: {
            product: true,
            promotion: true,
          },
        },
      },
    });
  }
}
