export interface AccountReadAccessor {
	existPhoneNumber(phoneNumber: string): Promise<boolean>;
}
