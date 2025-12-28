import { UpdateSupplierUsecase } from "../../../src/application/services/supplier/update-supplier.usecase";

describe("UpdateSupplierUsecase Unit Tests", () => {
  let usecase: UpdateSupplierUsecase;
  let mockSupplierRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupplierRepo = {
      update: jest.fn(),
    };

    usecase = new UpdateSupplierUsecase(mockSupplierRepo);
  });

  describe("Success Cases", () => {
    it("should update supplier name", async () => {
      const input = {
        id: 1,
        name: "Updated Supplier",
      };
      const updatedSupplier = {
        id: 1,
        name: "Updated Supplier",
        address: "Old Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(updatedSupplier);
      expect(mockSupplierRepo.update).toHaveBeenCalledWith(input);
      expect(result.supplier.name).toBe("Updated Supplier");
    });

    it("should update supplier address", async () => {
      const input = {
        id: 1,
        address: "New Address",
      };
      const updatedSupplier = {
        id: 1,
        name: "Supplier Name",
        address: "New Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.address).toBe("New Address");
      expect(mockSupplierRepo.update).toHaveBeenCalledWith(input);
    });

    it("should update supplier phone number", async () => {
      const input = {
        id: 1,
        phoneNumber: "0987654321",
      };
      const updatedSupplier = {
        id: 1,
        name: "Supplier Name",
        address: "Some Address",
        phoneNumber: "0987654321",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.phoneNumber).toBe("0987654321");
      expect(mockSupplierRepo.update).toHaveBeenCalledWith(input);
    });

    it("should update all supplier fields", async () => {
      const input = {
        id: 1,
        name: "New Name",
        address: "New Address",
        phoneNumber: "0111111111",
      };
      const updatedSupplier = {
        id: 1,
        ...input,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(updatedSupplier);
      expect(result.supplier.name).toBe("New Name");
      expect(result.supplier.address).toBe("New Address");
      expect(result.supplier.phoneNumber).toBe("0111111111");
    });

    it("should update supplier with only ID and name", async () => {
      const input = {
        id: 2,
        name: "Updated Name Only",
      };
      const updatedSupplier = {
        id: 2,
        name: "Updated Name Only",
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.id).toBe(2);
      expect(result.supplier.name).toBe("Updated Name Only");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input = {
        name: "Updated Name",
      } as any;

      mockSupplierRepo.update.mockRejectedValue(new Error("ID is required"));

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when ID is null", async () => {
      const input = {
        id: null,
        name: "Updated Name",
      } as any;

      mockSupplierRepo.update.mockRejectedValue(new Error("ID is required"));

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when ID is negative", async () => {
      const input = {
        id: -1,
        name: "Updated Name",
      };

      mockSupplierRepo.update.mockRejectedValue(
        new Error("ID must be positive")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when ID is zero", async () => {
      const input = {
        id: 0,
        name: "Updated Name",
      };

      mockSupplierRepo.update.mockRejectedValue(
        new Error("ID must be positive")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when all optional fields are missing", async () => {
      const input = {
        id: 1,
      };

      mockSupplierRepo.update.mockRejectedValue(
        new Error("At least one field to update is required")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name exceeds max length", async () => {
      const input = {
        id: 1,
        name: "A".repeat(256),
      };

      mockSupplierRepo.update.mockRejectedValue(new Error("Name too long"));

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should preserve ID during update", async () => {
      const input = {
        id: 42,
        name: "Updated Name",
      };
      const updatedSupplier = {
        id: 42,
        name: "Updated Name",
        address: "Old Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.id).toBe(42);
      expect(result.supplier.id).toBe(input.id);
    });

    it("should not modify unspecified fields", async () => {
      const input = {
        id: 1,
        name: "New Name",
      };
      const updatedSupplier = {
        id: 1,
        name: "New Name",
        address: "Unchanged Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.address).toBe("Unchanged Address");
      expect(result.supplier.phoneNumber).toBe("0123456789");
    });

    it("should return updated supplier data", async () => {
      const input = {
        id: 1,
        name: "Updated",
        address: "New Address",
      };
      const updatedSupplier = {
        id: 1,
        name: "Updated",
        address: "New Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result).toHaveProperty("supplier");
      expect(result.supplier).toEqual(updatedSupplier);
    });

    it("should handle updating multiple suppliers independently", async () => {
      mockSupplierRepo.update
        .mockResolvedValueOnce({
          id: 1,
          name: "Updated 1",
          address: "Address 1",
          phoneNumber: "0111111111",
        })
        .mockResolvedValueOnce({
          id: 2,
          name: "Updated 2",
          address: "Address 2",
          phoneNumber: "0222222222",
        });

      const result1 = await usecase.execute({ id: 1, name: "Updated 1" });
      const result2 = await usecase.execute({ id: 2, name: "Updated 2" });

      expect(result1.supplier.id).toBe(1);
      expect(result2.supplier.id).toBe(2);
      expect(mockSupplierRepo.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long name", async () => {
      const longName = "A".repeat(255);
      const input = {
        id: 1,
        name: longName,
      };
      const updatedSupplier = {
        id: 1,
        name: longName,
        address: "Address",
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name.length).toBe(255);
    });

    it("should handle very long address", async () => {
      const longAddress = "A".repeat(500);
      const input = {
        id: 1,
        address: longAddress,
      };
      const updatedSupplier = {
        id: 1,
        name: "Supplier Name",
        address: longAddress,
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.address?.length).toBe(500);
    });

    it("should handle phone number with special formatting", async () => {
      const input = {
        id: 1,
        phoneNumber: "+84 (123) 456-7890",
      };
      const updatedSupplier = {
        id: 1,
        name: "Supplier Name",
        address: "Address",
        phoneNumber: "+84 (123) 456-7890",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.phoneNumber).toBe("+84 (123) 456-7890");
    });

    it("should handle Vietnamese characters", async () => {
      const input = {
        id: 1,
        name: "Công Ty Cổ Phần ABC Việt Nam",
        address: "Thành phố Hồ Chí Minh",
      };
      const updatedSupplier = {
        id: 1,
        ...input,
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toContain("Việt Nam");
      expect(result.supplier.address).toContain("Hồ Chí Minh");
    });

    it("should handle special characters in name", async () => {
      const input = {
        id: 1,
        name: "Company & Associates (Ltd.)",
      };
      const updatedSupplier = {
        id: 1,
        name: "Company & Associates (Ltd.)",
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toContain("&");
      expect(result.supplier.name).toContain("(");
    });

    it("should handle empty string for address clear", async () => {
      const input = {
        id: 1,
        address: "",
      };
      const updatedSupplier = {
        id: 1,
        name: "Supplier Name",
        address: "",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.address).toBe("");
    });

    it("should handle large ID numbers", async () => {
      const input = {
        id: 2147483647,
        name: "Updated Name",
      };
      const updatedSupplier = {
        id: 2147483647,
        name: "Updated Name",
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.update.mockResolvedValue(updatedSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.id).toBe(2147483647);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle sequential updates to same supplier", async () => {
      mockSupplierRepo.update
        .mockResolvedValueOnce({
          id: 1,
          name: "Update 1",
          address: "Address 1",
          phoneNumber: "0111111111",
        })
        .mockResolvedValueOnce({
          id: 1,
          name: "Update 1",
          address: "Address 2",
          phoneNumber: "0111111111",
        })
        .mockResolvedValueOnce({
          id: 1,
          name: "Update 1",
          address: "Address 2",
          phoneNumber: "0222222222",
        });

      const update1 = await usecase.execute({ id: 1, name: "Update 1" });
      const update2 = await usecase.execute({ id: 1, address: "Address 2" });
      const update3 = await usecase.execute({
        id: 1,
        phoneNumber: "0222222222",
      });

      expect(update1.supplier.id).toBe(1);
      expect(update2.supplier.id).toBe(1);
      expect(update3.supplier.id).toBe(1);
      expect(mockSupplierRepo.update).toHaveBeenCalledTimes(3);
    });

    it("should handle updating multiple suppliers concurrently", async () => {
      mockSupplierRepo.update
        .mockResolvedValueOnce({
          id: 1,
          name: "Updated 1",
          address: undefined,
          phoneNumber: undefined,
        })
        .mockResolvedValueOnce({
          id: 2,
          name: "Updated 2",
          address: undefined,
          phoneNumber: undefined,
        })
        .mockResolvedValueOnce({
          id: 3,
          name: "Updated 3",
          address: undefined,
          phoneNumber: undefined,
        });

      const updates = [
        { id: 1, name: "Updated 1" },
        { id: 2, name: "Updated 2" },
        { id: 3, name: "Updated 3" },
      ];

      const promises = updates.map((update) => usecase.execute(update));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.supplier.id).toBe(index + 1);
      });
    });

    it("should handle update with database error", async () => {
      mockSupplierRepo.update.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        usecase.execute({ id: 1, name: "Updated" })
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle supplier not found error", async () => {
      mockSupplierRepo.update.mockRejectedValue(
        new Error("Supplier not found")
      );

      await expect(
        usecase.execute({ id: 999, name: "Updated" })
      ).rejects.toThrow("Supplier not found");
    });
  });
});
