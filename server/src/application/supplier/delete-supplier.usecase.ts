import { SupplierRepository } from "../../infrastructure/repositories/supplier.repository";

export class DeleteSupplierUsecase {
  constructor(private readonly supplierRepo: SupplierRepository) {}

  async execute(input: { id: number }) {
    await this.supplierRepo.delete(input.id);
    return { success: true };
  }
}
