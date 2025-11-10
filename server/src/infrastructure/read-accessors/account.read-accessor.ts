import { PrismaClient } from "@prisma/client";

export class AccountReadAccessor {
	constructor(private readonly prisma: PrismaClient) {}

	async existPhoneNumber(phoneNumber: string) {
		const result = await this.prisma.account.count({
			where: { phoneNumber: phoneNumber },
		});

		return result === 1;
	}
}
