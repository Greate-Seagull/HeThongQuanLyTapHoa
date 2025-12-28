import { CreateGoodReceiptUsecase } from "../../../src/application/services/good-receipt/create-good-receipt.usecase";
import { EmployeeReadAccessor } from "../../../src/application/services/read-accessors/employee.read-accessor";
import { ProductRepository } from "../../../src/application/repositories/product.repository";
import { GoodReceiptRepository } from "../../../src/application/repositories/good-receipt.repository";
import { TransactionManager } from "../../../src/application/transactions/base.transaction";
import { Product } from "../../../src/domain/entities/product";
import { GoodReceipt } from "../../../src/domain/entities/good-receipt";
import { buildProduct } from "../../helpers/test-helpers";

describe("CreateGoodReceiptUsecase Unit Tests", () => {
	let usecase: CreateGoodReceiptUsecase;
	let mockEmployeeRead: jest.Mocked<EmployeeReadAccessor>;
	let mockProductRepo: jest.Mocked<ProductRepository>;
	let mockGoodReceiptRepo: jest.Mocked<GoodReceiptRepository>;
	let mockTransactionManager: jest.Mocked<TransactionManager>;

	beforeEach(() => {
		mockEmployeeRead = {
			getNameById: jest.fn(),
		} as any;

		mockProductRepo = {
			getByIds: jest.fn(),
			saveMany: jest.fn(),
		} as any;

		mockGoodReceiptRepo = {
			add: jest.fn(),
		} as any;

		mockTransactionManager = {
			transaction: jest.fn((callback) => callback(null)),
		} as any;

		usecase = new CreateGoodReceiptUsecase(
			mockEmployeeRead,
			mockProductRepo,
			mockGoodReceiptRepo,
			mockTransactionManager
		);
	});

	describe("Success Cases", () => {
		it("should create good receipt with single product", async () => {
			// Arrange
			const product = buildProduct({ id: 1, name: "Coca Cola", amount: 50 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Nguyen Van A" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 100, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 100, price: 8000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.goodReceiptId).toBe(100);
			expect(result.employeeName).toBe("Nguyen Van A");
			expect(result.products.length).toBe(1);
			expect(result.products[0].amount).toBe(150); // 50 + 100
		});

		it("should create good receipt with multiple products", async () => {
			// Arrange
			const product1 = buildProduct({ id: 1, name: "Pepsi", amount: 30 });
			const product2 = buildProduct({ id: 2, name: "Sprite", amount: 20 });
			const product3 = buildProduct({ id: 3, name: "Fanta", amount: 15 });

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 2, name: "Tran Van B" });
			mockProductRepo.getByIds.mockResolvedValue([product1, product2, product3]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 101, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product1, product2, product3]);

			const input = {
				authId: 2,
				items: [
					{ productId: 1, quantity: 50, price: 8000 },
					{ productId: 2, quantity: 30, price: 7500 },
					{ productId: 3, quantity: 40, price: 7000 },
				],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.goodReceiptId).toBe(101);
			expect(result.products.length).toBe(3);
			expect(result.products[0].amount).toBe(80); // 30 + 50
			expect(result.products[1].amount).toBe(50); // 20 + 30
			expect(result.products[2].amount).toBe(55); // 15 + 40
		});

		it("should increase product stock correctly", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 100 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 102, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 500, price: 10000 }],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(product.amount).toBe(600); // 100 + 500
		});

		it("should handle duplicate productIds by summing quantities", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 50 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 103, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [
					{ productId: 1, quantity: 30, price: 9000 },
					{ productId: 1, quantity: 20, price: 9000 }, // Same product
				],
			};

			// Act
			await usecase.execute(input);

			// Assert
			// receiveStock called twice: 30 + 20 = 50
			expect(product.amount).toBe(100); // 50 + 30 + 20
		});

		it("should handle very large quantity import", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 1000 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 104, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 10000, price: 5000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(product.amount).toBe(11000);
			expect(result.products[0].amount).toBe(11000);
		});
	});

	describe("Validation Error Cases", () => {
		it("should throw error when authId is missing", async () => {
			// Arrange
			const input = {
				items: [{ productId: 1, quantity: 10, price: 5000 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when items array is empty", async () => {
			// Arrange
			const input = {
				authId: 1,
				items: [],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when productId does not exist", async () => {
			// Arrange
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([]); // No products found

			const input = {
				authId: 1,
				items: [{ productId: 999, quantity: 10, price: 5000 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow("Products not found: 999");
		});

		it("should throw error when some products do not exist", async () => {
			// Arrange
			const product1 = buildProduct({ id: 1 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product1]); // Only 1 out of 3

			const input = {
				authId: 1,
				items: [
					{ productId: 1, quantity: 10, price: 5000 },
					{ productId: 888, quantity: 20, price: 6000 }, // Missing
					{ productId: 777, quantity: 15, price: 7000 }, // Missing
				],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow("Products not found");
		});

		it("should throw error when quantity is zero", async () => {
			// Arrange
			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 0, price: 5000 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when quantity is negative", async () => {
			// Arrange
			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: -10, price: 5000 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when price is zero", async () => {
			// Arrange
			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 10, price: 0 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when price is negative", async () => {
			// Arrange
			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 10, price: -5000 }],
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow();
		});
	});

	describe("Transaction Management", () => {
		it("should save good receipt within transaction", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 50 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 105, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 100, price: 8000 }],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTransactionManager.transaction).toHaveBeenCalled();
			expect(mockGoodReceiptRepo.add).toHaveBeenCalled();
			expect(mockProductRepo.saveMany).toHaveBeenCalled();
		});

		it("should pass transaction context to repositories", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 50 });
			const mockTxContext = null; // Simulated transaction context

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 106, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 50, price: 7000 }],
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockGoodReceiptRepo.add).toHaveBeenCalledWith(
				expect.any(GoodReceipt),
				mockTxContext
			);
			expect(mockProductRepo.saveMany).toHaveBeenCalledWith(
				[product],
				mockTxContext
			);
		});
	});

	describe("Business Scenarios", () => {
		it("should handle restocking popular products", async () => {
			// Arrange
			const cocaCola = buildProduct({ id: 1, name: "Coca Cola", amount: 20 });
			const pepsi = buildProduct({ id: 2, name: "Pepsi", amount: 15 });

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 3, name: "Warehouse Manager" });
			mockProductRepo.getByIds.mockResolvedValue([cocaCola, pepsi]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 200, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([cocaCola, pepsi]);

			const input = {
				authId: 3,
				items: [
					{ productId: 1, quantity: 200, price: 7500 },
					{ productId: 2, quantity: 150, price: 7200 },
				],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.goodReceiptId).toBe(200);
			expect(cocaCola.amount).toBe(220); // 20 + 200
			expect(pepsi.amount).toBe(165); // 15 + 150
		});

		it("should handle bulk import from supplier", async () => {
			// Arrange
			const product1 = buildProduct({ id: 10, name: "Snack A", amount: 50 });
			const product2 = buildProduct({ id: 11, name: "Snack B", amount: 30 });
			const product3 = buildProduct({ id: 12, name: "Snack C", amount: 40 });

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 5, name: "Import Staff" });
			mockProductRepo.getByIds.mockResolvedValue([product1, product2, product3]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 201, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product1, product2, product3]);

			const input = {
				authId: 5,
				items: [
					{ productId: 10, quantity: 500, price: 3000 },
					{ productId: 11, quantity: 400, price: 3500 },
					{ productId: 12, quantity: 600, price: 3200 },
				],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.products.length).toBe(3);
			expect(product1.amount).toBe(550);
			expect(product2.amount).toBe(430);
			expect(product3.amount).toBe(640);
		});

		it("should handle emergency restock (low inventory)", async () => {
			// Arrange
			const product = buildProduct({ id: 1, name: "Essential Item", amount: 3 });

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Emergency Staff" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 202, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 100, price: 5000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(product.amount).toBe(103); // 3 + 100 (restocked from critically low)
		});

		it("should handle seasonal bulk purchase (Tet preparation)", async () => {
			// Arrange
			const banhChung = buildProduct({ id: 20, name: "Banh Chung", amount: 0 });
			const mut = buildProduct({ id: 21, name: "Mut Tet", amount: 0 });

			mockEmployeeRead.getNameById.mockResolvedValue({ id: 8, name: "Seasonal Buyer" });
			mockProductRepo.getByIds.mockResolvedValue([banhChung, mut]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 300, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([banhChung, mut]);

			const input = {
				authId: 8,
				items: [
					{ productId: 20, quantity: 1000, price: 120000 },
					{ productId: 21, quantity: 800, price: 70000 },
				],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(banhChung.amount).toBe(1000); // 0 + 1000
			expect(mut.amount).toBe(800); // 0 + 800
		});
	});

	describe("Edge Cases", () => {
		it("should handle receiving into empty stock", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 0 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 400, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 50, price: 10000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(product.amount).toBe(50); // 0 + 50
		});

		it("should handle very high price products", async () => {
			// Arrange
			const luxuryProduct = buildProduct({ id: 1, amount: 5 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([luxuryProduct]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 401, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([luxuryProduct]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 10, price: 5000000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(luxuryProduct.amount).toBe(15);
		});

		it("should handle single unit imports", async () => {
			// Arrange
			const product = buildProduct({ id: 1, amount: 10 });
			mockEmployeeRead.getNameById.mockResolvedValue({ id: 1, name: "Employee" });
			mockProductRepo.getByIds.mockResolvedValue([product]);
			mockGoodReceiptRepo.add.mockResolvedValue({ id: 402, createdAt: new Date() } as any);
			mockProductRepo.saveMany.mockResolvedValue([product]);

			const input = {
				authId: 1,
				items: [{ productId: 1, quantity: 1, price: 8000 }],
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(product.amount).toBe(11); // 10 + 1
		});
	});
});
