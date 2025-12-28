import { SignInUsecase } from "../../../src/application/services/customer-account/sign-in.usecase";
import { UserRepository } from "../../../src/application/repositories/user.repository";
import { AccountRepository } from "../../../src/application/repositories/account.repository";
import { PasswordService, TokenService } from "../../../src/domain/services/encrypt.service";
import { buildUser } from "../../helpers/test-helpers";

describe("SignInUsecase Unit Tests", () => {
	let usecase: SignInUsecase;
	let mockUserRepo: jest.Mocked<UserRepository>;
	let mockAccountRepo: jest.Mocked<AccountRepository>;
	let mockPasswordService: jest.Mocked<PasswordService>;
	let mockTokenService: jest.Mocked<TokenService>;

	beforeEach(() => {
		mockUserRepo = {
			getById: jest.fn(),
		} as any;

		mockAccountRepo = {
			getByPhoneNumber: jest.fn(),
			save: jest.fn(),
		} as any;

		mockPasswordService = {
			comparePassword: jest.fn(),
		} as any;

		mockTokenService = {
			generateJwt: jest.fn(),
		} as any;

		usecase = new SignInUsecase(
			mockUserRepo,
			mockAccountRepo,
			mockPasswordService,
			mockTokenService
		);
	});

	describe("Success Cases", () => {
		it("should sign in successfully with valid credentials", async () => {
			// Arrange
			const user = buildUser({ id: 1, name: "John Doe", point: 100 });
			const account = {
				id: 1,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 1,
				signIn: jest.fn(),
			};
			const token = "valid.jwt.token";

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue(token);

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBe(token);
			expect(result.user.id).toBe(1);
			expect(result.user.name).toBe("John Doe");
			expect(mockAccountRepo.save).toHaveBeenCalled();
		});

		it("should return user with correct point balance", async () => {
			// Arrange
			const user = buildUser({ id: 2, point: 500 });
			const account = {
				id: 2,
				phoneNumber: "0987654321",
				passwordHash: "hashedPassword",
				userId: 2,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0987654321",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.user.point).toBe(500);
		});

		it("should generate JWT token with user ID", async () => {
			// Arrange
			const user = buildUser({ id: 3 });
			const account = {
				id: 3,
				phoneNumber: "0111222333",
				passwordHash: "hashedPassword",
				userId: 3,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("generated.token");

			const input = {
				phoneNumber: "0111222333",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTokenService.generateJwt).toHaveBeenCalledWith({
				id: 3,
				position: "CUSTOMER",
			});
		});

		it("should call account.signIn() method", async () => {
			// Arrange
			const user = buildUser({ id: 4 });
			const account = {
				id: 4,
				phoneNumber: "0999888777",
				passwordHash: "hashedPassword",
				userId: 4,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0999888777",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(account.signIn).toHaveBeenCalled();
		});
	});

	describe("Validation Error Cases", () => {
		it("should throw error when phone number is missing", async () => {
			const input = {
				password: "password123",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when password is missing", async () => {
			const input = {
				phoneNumber: "0123456789",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when account not found", async () => {
			// Arrange
			mockAccountRepo.getByPhoneNumber.mockResolvedValue(null);

			const input = {
				phoneNumber: "0000000000",
				password: "password123",
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Invalid phone number or password"
			);
		});

		it("should throw error when password is incorrect", async () => {
			// Arrange
			const account = {
				id: 5,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 5,
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(false);

			const input = {
				phoneNumber: "0123456789",
				password: "wrongPassword",
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Invalid phone number or password"
			);
		});

		it("should throw error for empty phone number", async () => {
			const input = {
				phoneNumber: "",
				password: "password123",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error for empty password", async () => {
			const input = {
				phoneNumber: "0123456789",
				password: "",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});
	});

	describe("Business Logic Cases", () => {
		it("should query account by phone number", async () => {
			// Arrange
			const user = buildUser({ id: 6 });
			const account = {
				id: 6,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 6,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockAccountRepo.getByPhoneNumber).toHaveBeenCalledWith("0123456789");
		});

		it("should verify password using password service", async () => {
			// Arrange
			const user = buildUser({ id: 7 });
			const account = {
				id: 7,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword123",
				userId: 7,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "myPassword",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(
				"myPassword",
				"hashedPassword123"
			);
		});

		it("should save account after successful sign in", async () => {
			// Arrange
			const user = buildUser({ id: 8 });
			const account = {
				id: 8,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 8,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockAccountRepo.save).toHaveBeenCalledWith(account);
		});

		it("should load user data from user repository", async () => {
			// Arrange
			const user = buildUser({ id: 9 });
			const account = {
				id: 9,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 9,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockUserRepo.getById).toHaveBeenCalledWith(9);
		});
	});

	describe("Edge Cases", () => {
		it("should handle phone number with special characters", async () => {
			// Arrange
			const user = buildUser({ id: 10 });
			const account = {
				id: 10,
				phoneNumber: "+84-123-456-789",
				passwordHash: "hashedPassword",
				userId: 10,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "+84-123-456-789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle very long password", async () => {
			// Arrange
			const user = buildUser({ id: 11 });
			const account = {
				id: 11,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 11,
				signIn: jest.fn(),
			};
			const longPassword = "A".repeat(500);

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: longPassword,
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle user with zero points", async () => {
			// Arrange
			const user = buildUser({ id: 12, point: 0 });
			const account = {
				id: 12,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 12,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.user.point).toBe(0);
		});

		it("should handle user with maximum points", async () => {
			// Arrange
			const user = buildUser({ id: 13, point: 999999 });
			const account = {
				id: 13,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 13,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.user.point).toBe(999999);
		});

		it("should handle user name with special characters", async () => {
			// Arrange
			const user = buildUser({ id: 14, name: "Nguyễn Văn A @#$%" });
			const account = {
				id: 14,
				phoneNumber: "0123456789",
				passwordHash: "hashedPassword",
				userId: 14,
				signIn: jest.fn(),
			};

			mockAccountRepo.getByPhoneNumber.mockResolvedValue(account as any);
			mockUserRepo.getById.mockResolvedValue(user);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockAccountRepo.save.mockResolvedValue(account as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				phoneNumber: "0123456789",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.user.name).toBe("Nguyễn Văn A @#$%");
		});
	});
});
