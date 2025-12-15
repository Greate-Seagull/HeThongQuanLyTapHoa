// import { PrismaClient } from "@prisma/client";
// import { UserRepository } from "../../src/infrastructure/repositories/prisma/user.prisma.repository";
// import { User } from "../../src/domain/entities/user";
// import { ChangeTracker } from "../../src/infrastructure/cache/change-tracker";
// import {
// 	fromPersistence,
// 	toPersistenceObject,
// } from "../../src/domain/services/mapper.service";
// import { buildSafePrismaSelect } from "../../src/domain/services/query-builder.service";

// // Mock the dependencies
// jest.mock("../../src/domain/services/mapper.service");
// jest.mock("../../src/domain/services/query-builder.service");
// jest.mock("../../src/infrastructure/cache/change-tracker");

// describe("UserRepository", () => {
// 	let userRepository: UserRepository;
// 	let mockPrisma: jest.Mocked<PrismaClient>;
// 	let mockTracker: jest.Mocked<ChangeTracker<any>>;

// 	const mockUserData = {
// 		id: 1,
// 		name: "John Doe",
// 		point: 100,
// 	};

// 	const mockUser = {
// 		id: 1,
// 		name: "John Doe",
// 		point: 100,
// 	} as User;

// 	beforeEach(() => {
// 		// Create mock Prisma client
// 		mockPrisma = {
// 			user: {
// 				findUnique: jest.fn(),
// 				update: jest.fn(),
// 				create: jest.fn(),
// 			},
// 		} as any;

// 		// Mock ChangeTracker
// 		mockTracker = {
// 			track: jest.fn(),
// 			diff: jest.fn(),
// 			detach: jest.fn(),
// 		} as any;

// 		(ChangeTracker as jest.Mock).mockImplementation(() => mockTracker);

// 		// Mock buildSafePrismaSelect
// 		(buildSafePrismaSelect as jest.Mock).mockReturnValue({
// 			select: { id: true, name: true, point: true },
// 		});

// 		// Create repository instance
// 		userRepository = new UserRepository(mockPrisma);
// 	});

// 	afterEach(() => {
// 		jest.clearAllMocks();
// 	});

// 	describe("getById", () => {
// 		it("should retrieve a user by id and track it", async () => {
// 			// Arrange
// 			mockPrisma.user.findUnique.mockResolvedValue(mockUserData);
// 			(fromPersistence as jest.Mock).mockReturnValue(mockUser);

// 			// Act
// 			const result = await userRepository.getById(1);

// 			// Assert
// 			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
// 				where: { id: 1 },
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(fromPersistence).toHaveBeenCalledWith(User, mockUserData);
// 			expect(mockTracker.track).toHaveBeenCalledWith(
// 				mockUser.id,
// 				mockUserData
// 			);
// 			expect(result).toEqual(mockUser);
// 		});

// 		it("should return null when user is not found", async () => {
// 			// Arrange
// 			mockPrisma.user.findUnique.mockResolvedValue(null);

// 			// Act
// 			const result = await userRepository.getById(999);

// 			// Assert
// 			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
// 				where: { id: 999 },
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(fromPersistence).not.toHaveBeenCalled();
// 			expect(mockTracker.track).not.toHaveBeenCalled();
// 			expect(result).toBeNull();
// 		});

// 		it("should handle errors from Prisma", async () => {
// 			// Arrange
// 			const error = new Error("Database connection failed");
// 			mockPrisma.user.findUnique.mockRejectedValue(error);

// 			// Act & Assert
// 			await expect(userRepository.getById(1)).rejects.toThrow(
// 				"Database connection failed"
// 			);
// 		});
// 	});

// 	describe("save", () => {
// 		it("should update an existing user with tracked changes", async () => {
// 			// Arrange
// 			const updatedUserData = { ...mockUserData, name: "Jane Doe" };
// 			const updatedUser = { ...mockUser, name: "Jane Doe" } as User;
// 			const persistenceObject = { name: "Jane Doe", point: 100 };
// 			const diff = { name: "Jane Doe" };

// 			mockPrisma.user.update.mockResolvedValue(updatedUserData);
// 			(toPersistenceObject as jest.Mock).mockReturnValue(
// 				persistenceObject
// 			);
// 			mockTracker.diff.mockReturnValue(diff);
// 			(fromPersistence as jest.Mock).mockReturnValue(updatedUser);

// 			// Act
// 			const result = await userRepository.save(null, updatedUser);

// 			// Assert
// 			expect(toPersistenceObject).toHaveBeenCalledWith(updatedUser);
// 			expect(mockTracker.diff).toHaveBeenCalledWith(
// 				updatedUser.id,
// 				persistenceObject
// 			);
// 			expect(mockPrisma.user.update).toHaveBeenCalledWith({
// 				where: { id: updatedUser.id },
// 				data: diff,
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(fromPersistence).toHaveBeenCalledWith(User, updatedUserData);
// 			expect(mockTracker.track).toHaveBeenCalledWith(
// 				updatedUser.id,
// 				updatedUserData
// 			);
// 			expect(result).toEqual(updatedUser);
// 		});

// 		it("should use transaction client when provided", async () => {
// 			// Arrange
// 			const mockTransaction = {
// 				user: {
// 					update: jest.fn().mockResolvedValue(mockUserData),
// 				},
// 			} as any;

// 			const persistenceObject = { name: "John Doe", point: 100 };
// 			const diff = { name: "John Doe" };

// 			(toPersistenceObject as jest.Mock).mockReturnValue(
// 				persistenceObject
// 			);
// 			mockTracker.diff.mockReturnValue(diff);
// 			(fromPersistence as jest.Mock).mockReturnValue(mockUser);

// 			// Act
// 			const result = await userRepository.save(mockTransaction, mockUser);

// 			// Assert
// 			expect(mockTransaction.user.update).toHaveBeenCalledWith({
// 				where: { id: mockUser.id },
// 				data: diff,
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(mockPrisma.user.update).not.toHaveBeenCalled();
// 			expect(result).toEqual(mockUser);
// 		});

// 		it("should handle update errors", async () => {
// 			// Arrange
// 			const error = new Error("Update failed");
// 			mockPrisma.user.update.mockRejectedValue(error);
// 			(toPersistenceObject as jest.Mock).mockReturnValue({});
// 			mockTracker.diff.mockReturnValue({});

// 			// Act & Assert
// 			await expect(userRepository.save(null, mockUser)).rejects.toThrow(
// 				"Update failed"
// 			);
// 		});
// 	});

// 	describe("add", () => {
// 		it("should create a new user and track it", async () => {
// 			// Arrange
// 			const newUserData = { id: 2, name: "Alice", point: 0 };
// 			const newUser = { id: null, name: "Alice", point: 0 } as User;
// 			const createdUser = { id: 2, name: "Alice", point: 0 } as User;
// 			const persistenceObject = { name: "Alice", point: 0 };
// 			const diff = { name: "Alice", point: 0 };

// 			mockPrisma.user.create.mockResolvedValue(newUserData);
// 			(toPersistenceObject as jest.Mock).mockReturnValue(
// 				persistenceObject
// 			);
// 			mockTracker.diff.mockReturnValue(diff);
// 			(fromPersistence as jest.Mock).mockReturnValue(createdUser);

// 			// Act
// 			const result = await userRepository.add(null, newUser);

// 			// Assert
// 			expect(toPersistenceObject).toHaveBeenCalledWith(newUser);
// 			expect(mockTracker.diff).toHaveBeenCalledWith(
// 				newUser.id,
// 				persistenceObject
// 			);
// 			expect(mockPrisma.user.create).toHaveBeenCalledWith({
// 				data: diff,
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(fromPersistence).toHaveBeenCalledWith(User, newUserData);
// 			expect(mockTracker.track).toHaveBeenCalledWith(
// 				createdUser.id,
// 				newUserData
// 			);
// 			expect(result).toEqual(createdUser);
// 		});

// 		it("should use transaction client when provided", async () => {
// 			// Arrange
// 			const mockTransaction = {
// 				user: {
// 					create: jest.fn().mockResolvedValue(mockUserData),
// 				},
// 			} as any;

// 			const persistenceObject = { name: "John Doe", point: 100 };
// 			const diff = { name: "John Doe", point: 100 };

// 			(toPersistenceObject as jest.Mock).mockReturnValue(
// 				persistenceObject
// 			);
// 			mockTracker.diff.mockReturnValue(diff);
// 			(fromPersistence as jest.Mock).mockReturnValue(mockUser);

// 			// Act
// 			const result = await userRepository.add(mockTransaction, mockUser);

// 			// Assert
// 			expect(mockTransaction.user.create).toHaveBeenCalledWith({
// 				data: diff,
// 				select: { id: true, name: true, point: true },
// 			});
// 			expect(mockPrisma.user.create).not.toHaveBeenCalled();
// 			expect(result).toEqual(mockUser);
// 		});

// 		it("should handle creation errors", async () => {
// 			// Arrange
// 			const error = new Error("Creation failed");
// 			mockPrisma.user.create.mockRejectedValue(error);
// 			(toPersistenceObject as jest.Mock).mockReturnValue({});
// 			mockTracker.diff.mockReturnValue({});

// 			// Act & Assert
// 			await expect(userRepository.add(null, mockUser)).rejects.toThrow(
// 				"Creation failed"
// 			);
// 		});
// 	});

// 	describe("baseQuery", () => {
// 		it("should have a static baseQuery property", () => {
// 			// Assert
// 			expect(UserRepository.baseQuery).toBeDefined();
// 			expect(buildSafePrismaSelect).toHaveBeenCalledWith(User);
// 		});
// 	});
// });
