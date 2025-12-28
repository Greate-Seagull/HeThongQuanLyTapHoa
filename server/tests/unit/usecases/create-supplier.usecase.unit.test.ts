import { CreateSupplierUsecase } from "../../../src/application/services/supplier/create-supplier.usecase";

describe("CreateSupplierUsecase Unit Tests", () => {
  let usecase: CreateSupplierUsecase;
  let mockSupplierRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupplierRepo = {
      create: jest.fn(),
    };

    usecase = new CreateSupplierUsecase(mockSupplierRepo);
  });

  describe("Success Cases", () => {
    it("should create supplier with all fields", async () => {
      const input = {
        name: "ABC Trading",
        address: "123 Main St, City",
        phoneNumber: "0123456789",
      };
      const createdSupplier = {
        id: 1,
        ...input,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(createdSupplier);
      expect(mockSupplierRepo.create).toHaveBeenCalledWith(input);
      expect(result.supplier.id).toBe(1);
      expect(result.supplier.name).toBe("ABC Trading");
    });

    it("should create supplier with only name", async () => {
      const input = { name: "XYZ Corp" };
      const createdSupplier = {
        id: 2,
        name: "XYZ Corp",
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(createdSupplier);
      expect(mockSupplierRepo.create).toHaveBeenCalledWith(input);
    });

    it("should create supplier with name and address", async () => {
      const input = {
        name: "Tech Supplies",
        address: "456 Tech Park",
      };
      const createdSupplier = {
        id: 3,
        ...input,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(createdSupplier);
      expect(mockSupplierRepo.create).toHaveBeenCalledWith(input);
    });

    it("should create supplier with name and phone", async () => {
      const input = {
        name: "Import Export Ltd",
        phoneNumber: "0987654321",
      };
      const createdSupplier = {
        id: 4,
        ...input,
        address: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(createdSupplier);
      expect(mockSupplierRepo.create).toHaveBeenCalledWith(input);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is missing", async () => {
      const input = {
        address: "Some Address",
        phoneNumber: "0123456789",
      } as any;

      mockSupplierRepo.create.mockRejectedValue(
        new Error("Name is required")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is null", async () => {
      const input = {
        name: null,
        address: "Some Address",
      } as any;

      mockSupplierRepo.create.mockRejectedValue(new Error("Name is required"));

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is empty string", async () => {
      const input = {
        name: "",
        address: "Some Address",
      };

      mockSupplierRepo.create.mockRejectedValue(
        new Error("Name is required")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name exceeds max length", async () => {
      const input = {
        name: "A".repeat(256),
        address: "Some Address",
      };

      mockSupplierRepo.create.mockRejectedValue(
        new Error("Name too long")
      );

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should return object with supplier property", async () => {
      const input = {
        name: "New Supplier",
        address: "123 Address",
        phoneNumber: "0111111111",
      };
      const createdSupplier = {
        id: 5,
        ...input,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result).toHaveProperty("supplier");
      expect(typeof result.supplier).toBe("object");
    });

    it("should generate unique IDs for multiple suppliers", async () => {
      const input1 = { name: "Supplier 1" };
      const input2 = { name: "Supplier 2" };

      mockSupplierRepo.create
        .mockResolvedValueOnce({ id: 1, ...input1, address: undefined, phoneNumber: undefined })
        .mockResolvedValueOnce({ id: 2, ...input2, address: undefined, phoneNumber: undefined });

      const result1 = await usecase.execute(input1);
      const result2 = await usecase.execute(input2);

      expect(result1.supplier.id).not.toBe(result2.supplier.id);
      expect(mockSupplierRepo.create).toHaveBeenCalledTimes(2);
    });

    it("should preserve supplier data without modification", async () => {
      const input = {
        name: "Original Name",
        address: "Original Address",
        phoneNumber: "0123456789",
      };
      const createdSupplier = {
        id: 6,
        ...input,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toBe(input.name);
      expect(result.supplier.address).toBe(input.address);
      expect(result.supplier.phoneNumber).toBe(input.phoneNumber);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long name", async () => {
      const longName = "A".repeat(255);
      const input = { name: longName };
      const createdSupplier = {
        id: 7,
        name: longName,
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name.length).toBe(255);
    });

    it("should handle very long address", async () => {
      const longAddress = "A".repeat(500);
      const input = {
        name: "Test Supplier",
        address: longAddress,
      };
      const createdSupplier = {
        id: 8,
        ...input,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.address?.length).toBe(500);
    });

    it("should handle phone number with various formats", async () => {
      const input = {
        name: "Test Supplier",
        phoneNumber: "+84 (123) 456-7890",
      };
      const createdSupplier = {
        id: 9,
        ...input,
        address: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.phoneNumber).toBe("+84 (123) 456-7890");
    });

    it("should handle supplier name with special characters", async () => {
      const input = {
        name: "Test & Co. Ltd. (Vietnam)",
        address: "123 Street #45",
        phoneNumber: "0123456789",
      };
      const createdSupplier = {
        id: 10,
        ...input,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toContain("&");
      expect(result.supplier.name).toContain("Ltd");
    });

    it("should handle Vietnamese characters in name", async () => {
      const input = {
        name: "Công Ty Cổ Phần ABC Việt Nam",
        address: "Thành phố Hồ Chí Minh",
      };
      const createdSupplier = {
        id: 11,
        ...input,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toContain("Việt Nam");
    });

    it("should handle whitespace in name", async () => {
      const input = {
        name: "  Supplier Name  ",
      };
      const createdSupplier = {
        id: 12,
        name: "  Supplier Name  ",
        address: undefined,
        phoneNumber: undefined,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier.name).toBe("  Supplier Name  ");
    });
  });

  describe("Complex Scenarios", () => {
    it("should create supplier with all optional fields filled", async () => {
      const input = {
        name: "Complete Supplier",
        address: "Full Address Details",
        phoneNumber: "0123456789",
      };
      const createdSupplier = {
        id: 13,
        ...input,
      };

      mockSupplierRepo.create.mockResolvedValue(createdSupplier);

      const result = await usecase.execute(input);

      expect(result.supplier).toEqual(createdSupplier);
      expect(result.supplier.address).toBeDefined();
      expect(result.supplier.phoneNumber).toBeDefined();
    });

    it("should handle multiple supplier creations sequentially", async () => {
      const suppliers = [
        { name: "Supplier 1", address: "Address 1", phoneNumber: "0111111111" },
        { name: "Supplier 2", address: "Address 2", phoneNumber: "0222222222" },
        { name: "Supplier 3", address: "Address 3", phoneNumber: "0333333333" },
      ];

      suppliers.forEach((supplier, index) => {
        mockSupplierRepo.create.mockResolvedValueOnce({
          id: index + 1,
          ...supplier,
        });
      });

      const results = [];
      for (const supplier of suppliers) {
        results.push(await usecase.execute(supplier));
      }

      expect(results).toHaveLength(3);
      expect(results[0].supplier.id).toBe(1);
      expect(results[1].supplier.id).toBe(2);
      expect(results[2].supplier.id).toBe(3);
      expect(mockSupplierRepo.create).toHaveBeenCalledTimes(3);
    });

    it("should handle repository error gracefully", async () => {
      const input = {
        name: "Test Supplier",
        address: "Test Address",
        phoneNumber: "0123456789",
      };

      mockSupplierRepo.create.mockRejectedValue(
        new Error("Database error")
      );

      await expect(usecase.execute(input)).rejects.toThrow("Database error");
    });

    it("should handle concurrent supplier creation attempts", async () => {
      const inputs = [
        { name: "Concurrent 1" },
        { name: "Concurrent 2" },
        { name: "Concurrent 3" },
      ];

      inputs.forEach((input, index) => {
        mockSupplierRepo.create.mockResolvedValueOnce({
          id: index + 1,
          ...input,
          address: undefined,
          phoneNumber: undefined,
        });
      });

      const promises = inputs.map((input) => usecase.execute(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.supplier.id).toBe(index + 1);
      });
    });
  });
});
