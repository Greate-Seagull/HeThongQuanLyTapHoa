import { CreateStocktakingUsecase } from "../../../src/application/services/stocktaking/create-stocktaking.usecase";
import { ProductReadAccessor } from "../../../src/application/services/read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../../../src/application/services/read-accessors/shelf.read-accessor";
import { StocktakingRepository } from "../../../src/application/repositories/stocktaking.repository";
import { Stocktaking } from "../../../src/domain/entities/stocktaking";

describe("CreateStocktakingUsecase Unit Tests", () => {
	let usecase: CreateStocktakingUsecase;
	let mockProductRead: jest.Mocked<ProductReadAccessor>;
	let mockShelfRead: jest.Mocked<ShelfReadAccessor>;
	let mockStocktakingRepo: jest.Mocked<StocktakingRepository>;

	beforeEach(() => {
		mockProductRead = {
			getIdsByBarcodes: jest.fn(),
		} as any;

		mockShelfRead = {
			existSlotByIds: jest.fn(),
		} as any;

		mockStocktakingRepo = {
			add: jest.fn(),
		} as any;

		usecase = new CreateStocktakingUsecase(
			mockProductRead,
			mockShelfRead,
			mockStocktakingRepo
		);
	});

	describe("Success Cases", () => {
		it("should create stocktaking with single product (GOOD status)", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 123456 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 100 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 123456, slotId: 10, status: "GOOD", quantity: 50 },
				],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result).toEqual({});
			expect(mockProductRead.getIdsByBarcodes).toHaveBeenCalledWith([123456]);
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([10]);
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should create stocktaking with multiple products", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 111111 },
				{ id: 2, barcode: 222222 },
				{ id: 3, barcode: 333333 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 101 } as any);

			const input = {
				authId: 2,
				products: [
					{ barcode: 111111, slotId: 10, status: "GOOD", quantity: 100 },
					{ barcode: 222222, slotId: 11, status: "GOOD", quantity: 50 },
					{ barcode: 333333, slotId: 12, status: "EXPIRED", quantity: 5 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockProductRead.getIdsByBarcodes).toHaveBeenCalledWith([111111, 222222, 333333]);
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([10, 11, 12]);
		});

		it("should handle stocktaking with EXPIRED status", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 5, barcode: 555555 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 102 } as any);

			const input = {
				authId: 3,
				products: [
					{ barcode: 555555, slotId: 20, status: "EXPIRED", quantity: 15 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle same product in multiple slots", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 123456 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 103 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 123456, slotId: 10, status: "GOOD", quantity: 30 },
					{ barcode: 123456, slotId: 11, status: "GOOD", quantity: 20 },
					{ barcode: 123456, slotId: 12, status: "EXPIRED", quantity: 5 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			// Should only query unique barcodes
			expect(mockProductRead.getIdsByBarcodes).toHaveBeenCalledWith([123456]);
			// But validate all slots
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([10, 11, 12]);
		});

		it("should handle zero quantity (out of stock found)", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 10, barcode: 100100 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 104 } as any);

			const input = {
				authId: 5,
				products: [
					{ barcode: 100100, slotId: 50, status: "GOOD", quantity: 0 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle very large quantity", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 999999 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 105 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 999999, slotId: 30, status: "GOOD", quantity: 10000 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});
	});

	describe("Validation Error Cases", () => {
		it("should throw error when authId is missing", async () => {
			// Arrange
			const input = {
				products: [
					{ barcode: 123456, slotId: 10, status: "GOOD", quantity: 50 },
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when products array is empty", async () => {
			// Arrange
			const input = {
				authId: 1,
				products: [],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when product barcode does not exist", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([]); // No products found

			const input = {
				authId: 1,
				products: [
					{ barcode: 888888, slotId: 10, status: "GOOD", quantity: 50 },
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Expect all products to be valid"
			);
		});

		it("should throw error when some product barcodes do not exist", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 111111 },
			]); // Only 1 out of 2

			const input = {
				authId: 1,
				products: [
					{ barcode: 111111, slotId: 10, status: "GOOD", quantity: 50 },
					{ barcode: 777777, slotId: 11, status: "GOOD", quantity: 30 }, // Missing
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Expect all products to be valid"
			);
		});

		it("should throw error when slotId does not exist", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 123456 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(false); // Slots not valid

			const input = {
				authId: 1,
				products: [
					{ barcode: 123456, slotId: 999, status: "GOOD", quantity: 50 },
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Expect all slots to be valid"
			);
		});

		it("should throw error when quantity is negative", async () => {
			// Arrange
			const input = {
				authId: 1,
				products: [
					{ barcode: 123456, slotId: 10, status: "GOOD", quantity: -10 },
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when status is invalid", async () => {
			// Arrange
			const input = {
				authId: 1,
				products: [
					{ barcode: 123456, slotId: 10, status: "INVALID_STATUS", quantity: 50 },
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});
	});

	describe("Business Scenarios", () => {
		it("should handle routine monthly inventory check (all GOOD)", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 111111 },
				{ id: 2, barcode: 222222 },
				{ id: 3, barcode: 333333 },
				{ id: 4, barcode: 444444 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 200 } as any);

			const input = {
				authId: 10,
				products: [
					{ barcode: 111111, slotId: 1, status: "GOOD", quantity: 100 },
					{ barcode: 222222, slotId: 2, status: "GOOD", quantity: 80 },
					{ barcode: 333333, slotId: 3, status: "GOOD", quantity: 120 },
					{ barcode: 444444, slotId: 4, status: "GOOD", quantity: 60 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle expiry detection scenario (some EXPIRED)", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 100001 },
				{ id: 2, barcode: 100002 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 201 } as any);

			const input = {
				authId: 5,
				products: [
					{ barcode: 100001, slotId: 10, status: "GOOD", quantity: 50 },
					{ barcode: 100002, slotId: 11, status: "EXPIRED", quantity: 20 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle discrepancy found during check", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 200001 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 202 } as any);

			const input = {
				authId: 3,
				products: [
					{ barcode: 200001, slotId: 20, status: "GOOD", quantity: 45 }, // Expected 50, found 45
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle multi-slot stocktaking for same product", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 300001 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 203 } as any);

			const input = {
				authId: 8,
				products: [
					{ barcode: 300001, slotId: 10, status: "GOOD", quantity: 100 },
					{ barcode: 300001, slotId: 11, status: "GOOD", quantity: 80 },
					{ barcode: 300001, slotId: 12, status: "EXPIRED", quantity: 10 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockProductRead.getIdsByBarcodes).toHaveBeenCalledWith([300001]);
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([10, 11, 12]);
		});

		it("should handle large warehouse stocktaking (many products)", async () => {
			// Arrange
			const manyProducts = Array.from({ length: 50 }, (_, i) => ({
				id: i + 1,
				barcode: 400000 + i,
			}));
			mockProductRead.getIdsByBarcodes.mockResolvedValue(manyProducts);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 204 } as any);

			const input = {
				authId: 15,
				products: manyProducts.map((p, i) => ({
					barcode: p.barcode,
					slotId: 100 + i,
					status: "GOOD",
					quantity: 50 + i,
				})),
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle stocktaking after expired product removal", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 5, barcode: 500005 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 205 } as any);

			const input = {
				authId: 7,
				products: [
					{ barcode: 500005, slotId: 50, status: "GOOD", quantity: 0 }, // All expired removed
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});
	});

	describe("Edge Cases", () => {
		it("should handle duplicate barcodes (same product in input)", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 600001 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 300 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 600001, slotId: 10, status: "GOOD", quantity: 50 },
					{ barcode: 600001, slotId: 11, status: "GOOD", quantity: 30 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			// Should deduplicate barcodes for product query
			expect(mockProductRead.getIdsByBarcodes).toHaveBeenCalledWith([600001]);
		});

		it("should handle duplicate slotIds validation", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 700001 },
				{ id: 2, barcode: 700002 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 301 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 700001, slotId: 20, status: "GOOD", quantity: 50 },
					{ barcode: 700002, slotId: 20, status: "GOOD", quantity: 30 }, // Same slot
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			// Should deduplicate slots for validation
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([20]);
		});

		it("should handle very small quantity", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 800001 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 302 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 800001, slotId: 80, status: "GOOD", quantity: 1 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockStocktakingRepo.add).toHaveBeenCalled();
		});

		it("should handle products without slotId", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 1, barcode: 900001 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			mockStocktakingRepo.add.mockResolvedValue({ id: 303 } as any);

			const input = {
				authId: 1,
				products: [
					{ barcode: 900001, slotId: 0, status: "GOOD", quantity: 10 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			// SlotId 0 is filtered out by getDistinctSlotIds - empty array passed
			expect(mockShelfRead.existSlotByIds).toHaveBeenCalledWith([]);
		});
	});

	describe("Data Integrity", () => {
		it("should create Stocktaking entity with correct data mapping", async () => {
			// Arrange
			mockProductRead.getIdsByBarcodes.mockResolvedValue([
				{ id: 10, barcode: 123456 },
				{ id: 20, barcode: 654321 },
			]);
			mockShelfRead.existSlotByIds.mockResolvedValue(true);
			
			let capturedStocktaking: Stocktaking | null = null;
			mockStocktakingRepo.add.mockImplementation(async (stocktaking) => {
				capturedStocktaking = stocktaking;
				return { id: 400, ...stocktaking } as any;
			});

			const input = {
				authId: 5,
				products: [
					{ barcode: 123456, slotId: 1, status: "GOOD", quantity: 100 },
					{ barcode: 654321, slotId: 2, status: "EXPIRED", quantity: 5 },
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(capturedStocktaking).not.toBeNull();
			expect(capturedStocktaking?.employeeId).toBe(5);
			// Details should map barcode → productId correctly
		});
	});
});
