import { PrismaClient } from "@prisma/client";

export class AccountReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async existPhoneNumber(phoneNumber: string) {
		const result = await this.prisma.account.count({
			where: { phoneNumber: phoneNumber },
		});

		return result === 1;
	}

	async getAll() {
		return await this.prisma.account.findMany({
			select: {
				id: true,
				phoneNumber: true,
				user: {
					select: {
						id: true,
						name: true,
						point: true,
					},
				},
			},
		});
	}

	async getById(id: number) {
		return await this.prisma.account.findUnique({
			where: { id },
			select: {
				id: true,
				phoneNumber: true,
				user: {
					select: {
						id: true,
						name: true,
						point: true,
					},
				},
			},
		});
	}
}
