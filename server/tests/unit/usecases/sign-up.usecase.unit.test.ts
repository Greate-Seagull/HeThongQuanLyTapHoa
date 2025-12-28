import { SignUpUsecase } from "../../../src/application/services/customer-account/sign-up.usecase";
import { UserRepository } from "../../../src/application/repositories/user.repository";
import { AccountRepository } from "../../../src/application/repositories/account.repository";
import { AccountReadAccessor } from "../../../src/infrastructure/read-accessors/prisma/account.read-accessor";
import { TransactionManager } from "../../../src/application/transactions/base.transaction";
import { PasswordService, TokenService } from "../../../src/domain/services/encrypt.service";
import { buildUser } from "../../helpers/test-helpers";

describe("SignUpUsecase Unit Tests", () => {
	let usecase: SignUpUsecase;
	let mockAccountRead: jest.Mocked<AccountReadAccessor>;
	let mockUserRepo: jest.Mocked<UserRepository>;
	let mockAccountRepo: jest.Mocked<AccountRepository>;
	let mockTransactionMag: jest.Mocked<TransactionManager>;
	let mockPasswordService: jest.Mocked<PasswordService>;
	let mockTokenService: jest.Mocked<TokenService>;

	beforeEach(() => {
		mockAccountRead = {
			existPhoneNumber: jest.fn(),
		} as any;

		mockUserRepo = {
			add: jest.fn(),
		} as any;

		mockAccountRepo = {
			add: jest.fn(),
		} as any;

		mockTransactionMag = {
			transaction: jest.fn((callback) => callback(null as any)),
		} as any;

		mockPasswordService = {
			generateSalt: jest.fn(),
			hashPassword: jest.fn(),
		} as any;

		mockTokenService = {
			generateJwt: jest.fn(),
		} as any;

		usecase = new SignUpUsecase(
			mockAccountRead,
			mockUserRepo,
			mockAccountRepo,
			mockTransactionMag,
			mockPasswordService,
			mockTokenService
		);
	});

	describe("Success Cases", () => {
		it("should sign up successfully with valid data", async () => {
			// Arrange
			const user = buildUser({ id: 1, name: "John Doe", point: 0 });
			const account = {
				id: 1,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				salt: "randomSalt",
				userId: 1,
			};
			const token = "generated.jwt.token";

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("randomSalt");
			mockPasswordService.hashPassword.mockReturnValue("hashedPassword");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue(token);

			const input = {
				name: "John Doe",
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBe(token);
			expect(mockAccountRead.existPhoneNumber).toHaveBeenCalledWith("0123456789");
		});

		it("should create user and account in transaction", async () => {
			// Arrange
			const user = buildUser({ id: 2 });
			const account = {
				id: 2,
				phoneNumber: "0987654321",
				passwordHash: "hashedPassword",
				salt: "salt123",
				userId: 2,
			};

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt123");
			mockPasswordService.hashPassword.mockReturnValue("hashedPassword");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "Test User",
				phoneNumber: "0987654321",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTransactionMag.transaction).toHaveBeenCalled();
			expect(mockUserRepo.add).toHaveBeenCalled();
			expect(mockAccountRepo.add).toHaveBeenCalled();
		});

		it("should hash password with salt before storing", async () => {
			// Arrange
			const user = buildUser({ id: 3 });
			const account = {
				id: 3,
				phoneNumber: "0111222333",
				passwordHash: "hashedPass",
				salt: "generatedSalt",
				userId: 3,
			};

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("generatedSalt");
			mockPasswordService.hashPassword.mockReturnValue("hashedPass");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 3",
				phoneNumber: "0111222333",
				password: "mySecretPassword",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockPasswordService.generateSalt).toHaveBeenCalled();
			expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
				"mySecretPassword",
				"generatedSalt"
			);
		});

		it("should generate JWT token with account id", async () => {
			// Arrange
			const user = buildUser({ id: 4 });
			const account = {
				id: 100,
				phoneNumber: "0999888777",
				passwordHash: "hash",
				salt: "salt",
				userId: 4,
			};

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("jwt.token");

			const input = {
				name: "User 4",
				phoneNumber: "0999888777",
				password: "password",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTokenService.generateJwt).toHaveBeenCalledWith({
				id: 100,
				position: null,
			});
		});
	});

	describe("Validation Error Cases", () => {
		it("should throw error when name is missing", async () => {
			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when phoneNumber is missing", async () => {
			const input = {
				name: "John Doe",
				password: "password123",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when password is missing", async () => {
			const input = {
				name: "John Doe",
				phoneNumber: "0123456789",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when phone number already exists", async () => {
			// Arrange
			mockAccountRead.existPhoneNumber.mockResolvedValue(true);

			const input = {
				name: "John Doe",
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"The phone number has already existed"
			);
		});

		it("should throw error for empty name", async () => {
			const input = {
				name: "",
				phoneNumber: "0123456789",
				password: "password123",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error for empty phoneNumber", async () => {
			const input = {
				name: "John Doe",
				phoneNumber: "",
				password: "password123",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error for empty password", async () => {
			const input = {
				name: "John Doe",
				phoneNumber: "0123456789",
				password: "",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});
	});

	describe("Business Logic Cases", () => {
		it("should check phone number existence before creating account", async () => {
			// Arrange
			const user = buildUser({ id: 5 });
			const account = { id: 5, phoneNumber: "0123456789", userId: 5 };

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 5",
				phoneNumber: "0123456789",
				password: "password",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockAccountRead.existPhoneNumber).toHaveBeenCalledWith("0123456789");
			expect(mockUserRepo.add).toHaveBeenCalled();
		});

		it("should use transaction to ensure atomic operation", async () => {
			// Arrange
			const user = buildUser({ id: 6 });
			const account = { id: 6, phoneNumber: "0111222333", userId: 6 };
			let transactionCallback: any;

			mockTransactionMag.transaction.mockImplementation((callback) => {
				transactionCallback = callback;
				return callback(null as any);
			});

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 6",
				phoneNumber: "0111222333",
				password: "password",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTransactionMag.transaction).toHaveBeenCalled();
			expect(transactionCallback).toBeDefined();
		});

		it("should save user before account in transaction", async () => {
			// Arrange
			const user = buildUser({ id: 7 });
			const account = { id: 7, phoneNumber: "0888777666", userId: 7 };
			const callOrder: string[] = [];

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockImplementation(async (u, tx) => {
				callOrder.push("user");
				return user;
			});
			mockAccountRepo.add.mockImplementation(async (a, tx) => {
				callOrder.push("account");
				return account as any;
			});
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 7",
				phoneNumber: "0888777666",
				password: "password",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(callOrder).toEqual(["user", "account"]);
		});
	});

	describe("Edge Cases", () => {
		it("should handle Vietnamese names", async () => {
			// Arrange
			const user = buildUser({ id: 8, name: "Nguyễn Văn A" });
			const account = { id: 8, phoneNumber: "0123456789", userId: 8 };

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "Nguyễn Văn A",
				phoneNumber: "0123456789",
				password: "password",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle phone number with special characters", async () => {
			// Arrange
			const user = buildUser({ id: 9 });
			const account = { id: 9, phoneNumber: "+84-123-456-789", userId: 9 };

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 9",
				phoneNumber: "+84-123-456-789",
				password: "password",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle very long password", async () => {
			// Arrange
			const user = buildUser({ id: 10 });
			const account = { id: 10, phoneNumber: "0123456789", userId: 10 };
			const longPassword = "A".repeat(500);

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hashedLongPassword");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "User 10",
				phoneNumber: "0123456789",
				password: longPassword,
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
			expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(longPassword, "salt");
		});

		it("should handle very long name", async () => {
			// Arrange
			const user = buildUser({ id: 11, name: "A".repeat(200) });
			const account = { id: 11, phoneNumber: "0123456789", userId: 11 };

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "A".repeat(200),
				phoneNumber: "0123456789",
				password: "password",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle name with special characters", async () => {
			// Arrange
			const user = buildUser({ id: 12, name: "John @#$% Doe" });
			const account = { id: 12, phoneNumber: "0123456789", userId: 12 };

			mockAccountRead.existPhoneNumber.mockResolvedValue(false);
			mockPasswordService.generateSalt.mockReturnValue("salt");
			mockPasswordService.hashPassword.mockReturnValue("hash");
			mockUserRepo.add.mockResolvedValue(user);
			mockAccountRepo.add.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				name: "John @#$% Doe",
				phoneNumber: "0123456789",
				password: "password",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});
	});
});
