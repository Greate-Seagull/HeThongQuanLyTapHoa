import { GetSuppliersUsecase } from "../../../src/application/services/supplier/get-suppliers.usecase";
import { SupplierReadAccessor } from "../../../src/infrastructure/read-accessors/prisma/supplier.read-accessor";

describe("GetSuppliersUsecase Unit Tests", () => {
	let usecase: GetSuppliersUsecase;
	let mockSupplierRead: jest.Mocked<SupplierReadAccessor>;

	beforeEach(() => {
		mockSupplierRead = {
			getSuppliers: jest.fn(),
		} as any;

		usecase = new GetSuppliersUsecase(mockSupplierRead);
	});

	describe("Success Cases", () => {
		it("should get all suppliers successfully", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Supplier A", address: "Addr A", phone: "123" },
				{ id: 2, name: "Supplier B", address: "Addr B", phone: "456" },
				{ id: 3, name: "Supplier C", address: "Addr C", phone: "789" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers).toBeDefined();
			expect(result.suppliers.length).toBe(3);
			expect(result.suppliers[0].name).toBe("Supplier A");
		});

		it("should return empty array when no suppliers exist", async () => {
			// Arrange
			mockSupplierRead.getSuppliers.mockResolvedValue([]);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers.length).toBe(0);
		});

		it("should return single supplier", async () => {
			// Arrange
			const suppliers = [{ id: 1, name: "Only Supplier", address: "Addr", phone: "123" }];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers.length).toBe(1);
			expect(result.suppliers[0].id).toBe(1);
		});

		it("should preserve supplier details", async () => {
			// Arrange
			const suppliers = [
				{
					id: 5,
					name: "Quality Supplier",
					address: "123 Main St",
					phone: "0123456789",
				},
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].name).toBe("Quality Supplier");
		});

		it("should return many suppliers", async () => {
			// Arrange
			const suppliers = Array.from({ length: 100 }, (_, i) => ({
				id: i + 1,
				name: `Supplier ${i + 1}`,
				address: `Address ${i + 1}`,
				phone: `123456789${i}`,
			}));
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers.length).toBe(100);
		});
	});

	describe("Business Logic Cases", () => {
		it("should call repository getSuppliers method", async () => {
			// Arrange
			mockSupplierRead.getSuppliers.mockResolvedValue([]);

			// Act
			await usecase.execute();

			// Assert
			expect(mockSupplierRead.getSuppliers).toHaveBeenCalled();
			expect(mockSupplierRead.getSuppliers).toHaveBeenCalledTimes(1);
		});

		it("should return data exactly as repository provides", async () => {
			// Arrange
			const suppliers = [
				{ id: 10, name: "Test", address: "Test", phone: "123" },
				{ id: 20, name: "Demo", address: "Demo", phone: "456" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers).toEqual(suppliers);
		});
	});

	describe("Edge Cases", () => {
		it("should handle suppliers with special characters in name", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Supplier @#$% & 特殊", address: "Addr", phone: "123" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].name).toBe("Supplier @#$% & 特殊");
		});

		it("should handle very long supplier name", async () => {
			// Arrange
			const longName = "A".repeat(500);
			const suppliers = [{ id: 1, name: longName, address: "Addr", phone: "123" }];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].name.length).toBe(500);
		});

		it("should handle large supplier IDs", async () => {
			// Arrange
			const suppliers = [
				{ id: 999999, name: "Large ID", address: "Addr", phone: "123" },
				{ id: 888888, name: "Another Large", address: "Addr", phone: "456" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].id).toBe(999999);
		});

		it("should handle suppliers with null optional fields", async () => {
			// Arrange
			const suppliers = [{ id: 1, name: "Supplier", address: null, phone: null }];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0]).toBeDefined();
		});

		it("should handle Vietnamese characters in supplier name", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Công Ty Cổ Phần ABC Việt Nam", address: "Thành phố Hồ Chí Minh", phone: "0123456789" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].name).toContain("Việt Nam");
			expect(result.suppliers[0].address).toContain("Hồ Chí Minh");
		});

		it("should handle supplier with phone number formats", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Test", address: "Addr", phone: "+84 (123) 456-7890" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].phone).toContain("+84");
		});

		it("should handle mixed full and partial supplier data", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Full", address: "Address", phone: "0111111111" },
				{ id: 2, name: "Partial", address: null, phone: null },
				{ id: 3, name: "Mixed", address: "Address", phone: null },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers).toHaveLength(3);
		});
	});

	describe("Error Handling Cases", () => {
		it("should throw error when accessor fails", async () => {
			// Arrange
			mockSupplierRead.getSuppliers.mockRejectedValue(new Error("Database error"));

			// Act & Assert
			await expect(usecase.execute()).rejects.toThrow("Database error");
		});

		it("should throw error when connection fails", async () => {
			// Arrange
			mockSupplierRead.getSuppliers.mockRejectedValue(new Error("Connection refused"));

			// Act & Assert
			await expect(usecase.execute()).rejects.toThrow("Connection refused");
		});

		it("should throw error when query timeout", async () => {
			// Arrange
			mockSupplierRead.getSuppliers.mockRejectedValue(new Error("Query timeout"));

			// Act & Assert
			await expect(usecase.execute()).rejects.toThrow("Query timeout");
		});
	});

	describe("Complex Scenarios", () => {
		it("should handle multiple sequential calls", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Supplier 1", address: "Address 1", phone: "0111111111" },
				{ id: 2, name: "Supplier 2", address: "Address 2", phone: "0222222222" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result1 = await usecase.execute();
			const result2 = await usecase.execute();
			const result3 = await usecase.execute();

			// Assert
			expect(result1.suppliers).toEqual(result2.suppliers);
			expect(result2.suppliers).toEqual(result3.suppliers);
			expect(mockSupplierRead.getSuppliers).toHaveBeenCalledTimes(3);
		});

		it("should handle concurrent calls", async () => {
			// Arrange
			const suppliers = [
				{ id: 1, name: "Supplier 1", address: "Address 1", phone: "0111111111" },
				{ id: 2, name: "Supplier 2", address: "Address 2", phone: "0222222222" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const promises = [
				usecase.execute(),
				usecase.execute(),
				usecase.execute(),
			];
			const results = await Promise.all(promises);

			// Assert
			expect(results).toHaveLength(3);
			results.forEach((result) => {
				expect(result.suppliers).toEqual(suppliers);
			});
			expect(mockSupplierRead.getSuppliers).toHaveBeenCalledTimes(3);
		});

		it("should handle large dataset retrieval", async () => {
			// Arrange
			const suppliers = Array.from({ length: 500 }, (_, i) => ({
				id: i + 1,
				name: `Supplier ${i + 1}`,
				address: `Address ${i + 1}`,
				phone: `0${String(i + 1).padStart(9, "0")}`,
			}));
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers).toHaveLength(500);
		});

		it("should maintain order of suppliers from accessor", async () => {
			// Arrange
			const suppliers = [
				{ id: 5, name: "Fifth", address: "Address 5", phone: "0555555555" },
				{ id: 2, name: "Second", address: "Address 2", phone: "0222222222" },
				{ id: 8, name: "Eighth", address: "Address 8", phone: "0888888888" },
			];
			mockSupplierRead.getSuppliers.mockResolvedValue(suppliers as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.suppliers[0].id).toBe(5);
			expect(result.suppliers[1].id).toBe(2);
			expect(result.suppliers[2].id).toBe(8);
		});
	});
});
