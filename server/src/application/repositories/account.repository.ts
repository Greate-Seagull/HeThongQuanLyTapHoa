import { Account } from "../../domain/entities/account";
import { BaseRepository } from "./base.repository";

export interface AccountRepository extends BaseRepository<Account> {
	getByPhoneNumber(phoneNumber: string): Promise<Account | null>;
}
