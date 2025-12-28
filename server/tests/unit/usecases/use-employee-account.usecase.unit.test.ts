import { UseAccountUsecase } from "../../../src/application/services/employee-account/use-account.usecase";
import { EmployeeAccountRepository } from "../../../src/application/repositories/employee-account.repository";
import { EmployeeReadAccessor } from "../../../src/application/services/read-accessors/employee.read-accessor";
import { PasswordService, TokenService } from "../../../src/domain/services/encrypt.service";

describe("UseAccountUsecase Unit Tests", () => {
	let usecase: UseAccountUsecase;
	let mockEmployeeAccountRepo: jest.Mocked<EmployeeAccountRepository>;
	let mockEmployeeRead: jest.Mocked<EmployeeReadAccessor>;
	let mockPasswordService: jest.Mocked<PasswordService>;
	let mockTokenService: jest.Mocked<TokenService>;

	beforeEach(() => {
		mockEmployeeAccountRepo = {
			getByUsername: jest.fn(),
			save: jest.fn(),
		} as any;

		mockEmployeeRead = {
			getPositionById: jest.fn(),
		} as any;

		mockPasswordService = {
			comparePassword: jest.fn(),
		} as any;

		mockTokenService = {
			generateJwt: jest.fn(),
		} as any;

		usecase = new UseAccountUsecase(
			mockEmployeeAccountRepo,
			mockEmployeeRead,
			mockPasswordService,
			mockTokenService
		);
	});

	describe("Success Cases", () => {
		it("should login SALES employee successfully", async () => {
			// Arrange
			const account = {
				id: 1,
				username: "sales001",
				passwordHash: "hashedPassword",
				employeeId: 1,
				signIn: jest.fn(),
			};
			const employee = {
				id: 1,
				name: "Sales Staff",
				position: "SALES",
			};
			const token = "sales.jwt.token";

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "sales001" } as any);
			mockTokenService.generateJwt.mockReturnValue(token);

			const input = {
				username: "sales001",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBe(token);
			expect(result.employee.id).toBe(1);
			expect(result.employee.name).toBe("Sales Staff");
			expect(result.employee.position).toBe("SALES");
			expect(result.employee.username).toBe("sales001");
		});

		it("should login INVENTORY employee successfully", async () => {
			// Arrange
			const account = {
				id: 2,
				username: "inventory002",
				passwordHash: "hashedPassword",
				employeeId: 2,
				signIn: jest.fn(),
			};
			const employee = {
				id: 2,
				name: "Inventory Staff",
				position: "INVENTORY",
			};

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "inventory002" } as any);
			mockTokenService.generateJwt.mockReturnValue("inventory.token");

			const input = {
				username: "inventory002",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.employee.position).toBe("INVENTORY");
			expect(result.token).toBeDefined();
		});

		it("should login RECEIVING employee successfully", async () => {
			// Arrange
			const account = {
				id: 3,
				username: "receiving003",
				passwordHash: "hashedPassword",
				employeeId: 3,
				signIn: jest.fn(),
			};
			const employee = {
				id: 3,
				name: "Receiving Staff",
				position: "RECEIVING",
			};

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "receiving003" } as any);
			mockTokenService.generateJwt.mockReturnValue("receiving.token");

			const input = {
				username: "receiving003",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.employee.position).toBe("RECEIVING");
			expect(result.token).toBeDefined();
		});

		it("should login MANAGER employee successfully", async () => {
			// Arrange
			const account = {
				id: 4,
				username: "manager001",
				passwordHash: "hashedPassword",
				employeeId: 4,
				signIn: jest.fn(),
			};
			const employee = {
				id: 4,
				name: "Store Manager",
				position: "MANAGER",
			};

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "manager001" } as any);
			mockTokenService.generateJwt.mockReturnValue("manager.token");

			const input = {
				username: "manager001",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.employee.position).toBe("MANAGER");
			expect(result.token).toBeDefined();
		});

		it("should call account.signIn() method", async () => {
			// Arrange
			const account = {
				id: 5,
				username: "staff001",
				passwordHash: "hashedPassword",
				employeeId: 5,
				signIn: jest.fn(),
			};
			const employee = { id: 5, name: "Staff", position: "SALES" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "staff001" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "staff001",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(account.signIn).toHaveBeenCalled();
		});
	});

	describe("Validation Error Cases", () => {
		it("should throw error when username is missing", async () => {
			const input = {
				password: "password123",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when password is missing", async () => {
			const input = {
				username: "sales001",
			} as any;

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error when username not found", async () => {
			// Arrange
			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);

			const input = {
				username: "nonexistent",
				password: "password123",
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Invalid username or password"
			);
		});

		it("should throw error when password is incorrect", async () => {
			// Arrange
			const account = {
				id: 6,
				username: "sales001",
				passwordHash: "hashedPassword",
				employeeId: 6,
			};

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(false);

			const input = {
				username: "sales001",
				password: "wrongPassword",
			};

			// Act & Assert
			await expect(usecase.execute(input)).rejects.toThrow(
				"Invalid username or password"
			);
		});

		it("should throw error for empty username", async () => {
			const input = {
				username: "",
				password: "password123",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});

		it("should throw error for empty password", async () => {
			const input = {
				username: "sales001",
				password: "",
			};

			await expect(usecase.execute(input)).rejects.toThrow();
		});
	});

	describe("Business Logic Cases", () => {
		it("should query account by username", async () => {
			// Arrange
			const account = {
				id: 7,
				username: "testuser",
				passwordHash: "hashedPassword",
				employeeId: 7,
				signIn: jest.fn(),
			};
			const employee = { id: 7, name: "Test User", position: "SALES" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "testuser" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "testuser",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockEmployeeAccountRepo.getByUsername).toHaveBeenCalledWith("testuser");
		});

		it("should verify password using password service", async () => {
			// Arrange
			const account = {
				id: 8,
				username: "staff002",
				passwordHash: "hashedPassword123",
				employeeId: 8,
				signIn: jest.fn(),
			};
			const employee = { id: 8, name: "Staff", position: "SALES" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "staff002" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "staff002",
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

		it("should load employee position", async () => {
			// Arrange
			const account = {
				id: 9,
				username: "staff003",
				passwordHash: "hashedPassword",
				employeeId: 9,
				signIn: jest.fn(),
			};
			const employee = { id: 9, name: "Staff", position: "INVENTORY" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "staff003" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "staff003",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockEmployeeRead.getPositionById).toHaveBeenCalledWith(9);
		});

		it("should generate JWT with employee id and position", async () => {
			// Arrange
			const account = {
				id: 10,
				username: "manager002",
				passwordHash: "hashedPassword",
				employeeId: 10,
				signIn: jest.fn(),
			};
			const employee = { id: 10, name: "Manager", position: "MANAGER" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "manager002" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "manager002",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockTokenService.generateJwt).toHaveBeenCalledWith({
				id: 10,
				position: "MANAGER",
			});
		});

		it("should save account after successful sign in", async () => {
			// Arrange
			const account = {
				id: 11,
				username: "staff004",
				passwordHash: "hashedPassword",
				employeeId: 11,
				signIn: jest.fn(),
			};
			const employee = { id: 11, name: "Staff", position: "SALES" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "staff004" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "staff004",
				password: "password123",
			};

			// Act
			await usecase.execute(input);

			// Assert
			expect(mockEmployeeAccountRepo.save).toHaveBeenCalledWith(account);
		});
	});

	describe("Edge Cases", () => {
		it("should handle username with special characters", async () => {
			// Arrange
			const account = {
				id: 12,
				username: "user_001@store",
				passwordHash: "hashedPassword",
				employeeId: 12,
				signIn: jest.fn(),
			};
			const employee = { id: 12, name: "Staff", position: "SALES" };

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "user_001@store" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "user_001@store",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
			expect(result.employee.username).toBe("user_001@store");
		});

		it("should handle very long password", async () => {
			// Arrange
			const account = {
				id: 13,
				username: "staff005",
				passwordHash: "hashedPassword",
				employeeId: 13,
				signIn: jest.fn(),
			};
			const employee = { id: 13, name: "Staff", position: "SALES" };
			const longPassword = "A".repeat(500);

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "staff005" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "staff005",
				password: longPassword,
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.token).toBeDefined();
		});

		it("should handle employee name with Vietnamese characters", async () => {
			// Arrange
			const account = {
				id: 14,
				username: "nvstaff",
				passwordHash: "hashedPassword",
				employeeId: 14,
				signIn: jest.fn(),
			};
			const employee = {
				id: 14,
				name: "Nguyễn Văn A",
				position: "SALES",
			};

			mockEmployeeAccountRepo.getByUsername.mockResolvedValue(account as any);
			mockPasswordService.comparePassword.mockReturnValue(true);
			mockEmployeeRead.getPositionById.mockResolvedValue(employee as any);
			mockEmployeeAccountRepo.save.mockResolvedValue({ ...account, username: "nvstaff" } as any);
			mockTokenService.generateJwt.mockReturnValue("token");

			const input = {
				username: "nvstaff",
				password: "password123",
			};

			// Act
			const result = await usecase.execute(input);

			// Assert
			expect(result.employee.name).toBe("Nguyễn Văn A");
		});
	});
});
