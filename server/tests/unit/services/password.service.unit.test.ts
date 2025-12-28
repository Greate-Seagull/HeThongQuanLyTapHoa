import { PasswordService } from "../../../src/domain/services/encrypt.service";

describe("PasswordService Unit Tests", () => {
	let service: PasswordService;
	const saltRound = 10;

	beforeEach(() => {
		service = new PasswordService(saltRound);
	});

	describe("generateSalt", () => {
		it("should generate a salt", () => {
			// Act
			const salt = service.generateSalt();

			// Assert
			expect(salt).toBeDefined();
			expect(typeof salt).toBe("string");
			expect(salt.length).toBeGreaterThan(0);
		});

		it("should generate unique salts on multiple calls", () => {
			// Act
			const salt1 = service.generateSalt();
			const salt2 = service.generateSalt();
			const salt3 = service.generateSalt();

			// Assert
			expect(salt1).not.toBe(salt2);
			expect(salt2).not.toBe(salt3);
			expect(salt1).not.toBe(salt3);
		});

		it("should generate bcrypt-formatted salt", () => {
			// Act
			const salt = service.generateSalt();

			// Assert
			// Bcrypt salts start with $2a$, $2b$, or $2y$
			expect(salt).toMatch(/^\$2[aby]\$/);
		});
	});

	describe("hashPassword", () => {
		it("should hash a password with salt", () => {
			// Arrange
			const password = "password123";
			const salt = service.generateSalt();

			// Act
			const hash = service.hashPassword(password, salt);

			// Assert
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash).not.toBe(password);
			expect(hash.length).toBeGreaterThan(password.length);
		});

		it("should produce consistent hash for same password and salt", () => {
			// Arrange
			const password = "mySecretPassword";
			const salt = service.generateSalt();

			// Act
			const hash1 = service.hashPassword(password, salt);
			const hash2 = service.hashPassword(password, salt);

			// Assert
			expect(hash1).toBe(hash2);
		});

		it("should produce different hashes for different salts", () => {
			// Arrange
			const password = "samePassword";
			const salt1 = service.generateSalt();
			const salt2 = service.generateSalt();

			// Act
			const hash1 = service.hashPassword(password, salt1);
			const hash2 = service.hashPassword(password, salt2);

			// Assert
			expect(hash1).not.toBe(hash2);
		});

		it("should produce different hashes for different passwords", () => {
			// Arrange
			const salt = service.generateSalt();

			// Act
			const hash1 = service.hashPassword("password1", salt);
			const hash2 = service.hashPassword("password2", salt);

			// Assert
			expect(hash1).not.toBe(hash2);
		});

		it("should handle empty password", () => {
			// Arrange
			const salt = service.generateSalt();

			// Act
			const hash = service.hashPassword("", salt);

			// Assert
			expect(hash).toBeDefined();
			expect(hash.length).toBeGreaterThan(0);
		});

		it("should handle very long password", () => {
			// Arrange
			const longPassword = "A".repeat(1000);
			const salt = service.generateSalt();

			// Act
			const hash = service.hashPassword(longPassword, salt);

			// Assert
			expect(hash).toBeDefined();
			expect(hash.length).toBeGreaterThan(0);
		});

		it("should handle password with special characters", () => {
			// Arrange
			const password = "p@ssw0rd!@#$%^&*()_+{}[]|\\:;\"'<>?,./";
			const salt = service.generateSalt();

			// Act
			const hash = service.hashPassword(password, salt);

			// Assert
			expect(hash).toBeDefined();
			expect(hash).not.toBe(password);
		});

		it("should handle Vietnamese characters in password", () => {
			// Arrange
			const password = "mậtkhẩu123";
			const salt = service.generateSalt();

			// Act
			const hash = service.hashPassword(password, salt);

			// Assert
			expect(hash).toBeDefined();
			expect(hash).not.toBe(password);
		});
	});

	describe("comparePassword", () => {
		it("should return true for correct password", () => {
			// Arrange
			const password = "correctPassword";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result = service.comparePassword(password, hash);

			// Assert
			expect(result).toBe(true);
		});

		it("should return false for incorrect password", () => {
			// Arrange
			const correctPassword = "correctPassword";
			const wrongPassword = "wrongPassword";
			const salt = service.generateSalt();
			const hash = service.hashPassword(correctPassword, salt);

			// Act
			const result = service.comparePassword(wrongPassword, hash);

			// Assert
			expect(result).toBe(false);
		});

		it("should return false for case-sensitive mismatch", () => {
			// Arrange
			const password = "Password123";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result = service.comparePassword("password123", hash); // Lowercase

			// Assert
			expect(result).toBe(false);
		});

		it("should return false for empty password when hash exists", () => {
			// Arrange
			const password = "actualPassword";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result = service.comparePassword("", hash);

			// Assert
			expect(result).toBe(false);
		});

		it("should handle complex password validation", () => {
			// Arrange
			const password = "C0mpl3x!P@ssw0rd#2025";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result = service.comparePassword(password, hash);

			// Assert
			expect(result).toBe(true);
		});

		it("should handle Vietnamese characters validation", () => {
			// Arrange
			const password = "mậtkhẩuViệtNam123";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result = service.comparePassword(password, hash);

			// Assert
			expect(result).toBe(true);
		});

		it("should return false for slightly different password", () => {
			// Arrange
			const password = "myPassword123";
			const salt = service.generateSalt();
			const hash = service.hashPassword(password, salt);

			// Act
			const result1 = service.comparePassword("myPassword124", hash);
			const result2 = service.comparePassword("myPassword 123", hash);
			const result3 = service.comparePassword("myPassword1234", hash);

			// Assert
			expect(result1).toBe(false);
			expect(result2).toBe(false);
			expect(result3).toBe(false);
		});
	});

	describe("Integration Scenarios", () => {
		it("should complete full password lifecycle: generate salt, hash, compare", () => {
			// Arrange
			const barePassword = "userPassword2025";

			// Act
			const salt = service.generateSalt();
			const hash = service.hashPassword(barePassword, salt);
			const isValid = service.comparePassword(barePassword, hash);
			const isInvalid = service.comparePassword("wrongPassword", hash);

			// Assert
			expect(salt).toBeDefined();
			expect(hash).toBeDefined();
			expect(hash).not.toBe(barePassword);
			expect(isValid).toBe(true);
			expect(isInvalid).toBe(false);
		});

		it("should handle multiple users with same password but different salts", () => {
			// Arrange
			const password = "commonPassword123";

			// Act - User 1
			const salt1 = service.generateSalt();
			const hash1 = service.hashPassword(password, salt1);

			// Act - User 2
			const salt2 = service.generateSalt();
			const hash2 = service.hashPassword(password, salt2);

			// Assert
			expect(hash1).not.toBe(hash2); // Different hashes
			expect(service.comparePassword(password, hash1)).toBe(true);
			expect(service.comparePassword(password, hash2)).toBe(true);
		});
	});
});
