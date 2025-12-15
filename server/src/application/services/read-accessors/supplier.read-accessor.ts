export interface SupplierReadAccessor {
	getSuppliers(): Promise<any>;
	getSupplierById(id: number): Promise<any>;
	existById(id: number): Promise<boolean>;
}
