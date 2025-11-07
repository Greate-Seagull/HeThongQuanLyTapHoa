import { employee } from "../../../tests/create-invoice/create-invoice.test-data";
import { Invoice, InvoiceDetail } from "../../domain/invoice";

export class InvoiceMapper {
	static toDomain(raw: any) {
		return Invoice.rehydrate(raw);
	}

	static toPersistence(entity: Invoice) {
		return {
			employeeId: entity.employeeId,
			userId: entity.userId,
			usedPoint: entity.usedPoint,
			total: entity.total,
			invoiceDetails: {
				create: entity.invoiceDetails.map(
					InvoiceDetailMapper.toPersistence
				),
			},
		};
	}
}

class InvoiceDetailMapper {
	static toPersistence(e: InvoiceDetail) {
		return {
			productId: e.productId,
			quantity: e.quantity,
			promotionId: e.promotionId,
		};
	}
}
