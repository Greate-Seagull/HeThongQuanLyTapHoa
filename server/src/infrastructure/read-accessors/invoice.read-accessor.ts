import { PrismaClient } from "@prisma/client";

export class InvoiceReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async getByUserId(userId: number) {
		return await this.prisma.invoice.findMany({
			where: { userId },
			include: {
				invoiceDetails: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								barcode: true,
								unit: true,
							},
						},
						promotion: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}
}