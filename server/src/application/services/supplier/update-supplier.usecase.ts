import { SupplierRepository } from "../../../infrastructure/repositories/supplier.repository";
import { UpdateSupplierDTO } from "../../../domain/supplier";

export class UpdateSupplierUsecase {
	constructor(private readonly supplierRepo: SupplierRepository) {}

	async execute(input: UpdateSupplierDTO) {
		const supplier = await this.supplierRepo.update(input);
		return { supplier };
	}
}
