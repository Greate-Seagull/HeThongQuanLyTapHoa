import { AccountReadAccessor } from "../../../application/services/read-accessors/account.read-accessor";
import { PrismaReadAccessor } from "./prisma.read-accessor";

export class AccountPrismaReadAccessor
	extends PrismaReadAccessor
	implements AccountReadAccessor
{
	async existPhoneNumber(phoneNumber: string): Promise<boolean> {
		const result = await this.client.account.count({
			where: { phoneNumber },
		});

		return result === 1;
	}
}
