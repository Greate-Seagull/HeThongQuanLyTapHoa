
import { PrismaClient } from "@prisma/client";

export class AccountReadAccessor {

	async getByUserId(userId: number) {
		return await this.prisma.account.findFirst({
			where: { userId: userId },
			select: {
				id: true,
				phoneNumber: true,
				user: {
					select: {
						id: true,
						name: true,
						point: true,
						avatar: true,
					},
				},
			},
		});
	}
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
						avatar: true,
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
						avatar: true,
					},
				},
			},
		});
	}
}
