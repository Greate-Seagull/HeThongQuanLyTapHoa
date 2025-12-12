import { SupplierReadAccessor } from "../../infrastructure/read-accessors/supplier.read-accessor";

export class GetSuppliersUsecase {
  constructor(private readonly supplierReadAccess: SupplierReadAccessor) {}

  async execute() {
    return { suppliers: await this.supplierReadAccess.getSuppliers() };
  }
}
