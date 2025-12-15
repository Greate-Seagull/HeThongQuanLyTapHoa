import { SupplierRepository } from "../../../infrastructure/repositories/supplier.repository";
import { CreateSupplierDTO } from "../../../domain/supplier";

export class CreateSupplierUsecase {
	constructor(private readonly supplierRepo: SupplierRepository) {}

	async execute(input: CreateSupplierDTO) {
		const supplier = await this.supplierRepo.create(input);
		return { supplier };
	}
}
