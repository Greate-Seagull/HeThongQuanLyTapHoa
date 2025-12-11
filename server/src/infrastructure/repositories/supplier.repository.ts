import { PrismaClient } from "@prisma/client";
import { CreateSupplierDTO, UpdateSupplierDTO, Supplier } from "../../domain/supplier";

export class SupplierRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSupplierDTO): Promise<Supplier> {
    return await this.prisma.supplier.create({
      data: {
        name: data.name,
        address: data.address,
        phoneNumber: data.phoneNumber,
      },
    });
  }

  async update(data: UpdateSupplierDTO): Promise<Supplier> {
    return await this.prisma.supplier.update({
      where: { id: data.id },
      data: {
        name: data.name,
        address: data.address,
        phoneNumber: data.phoneNumber,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id },
    });
  }

  async getById(id: number): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: { id },
    });
  }
}
