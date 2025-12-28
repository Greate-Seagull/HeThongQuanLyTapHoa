import { TokenService } from "../../../src/domain/services/encrypt.service";
import jwt from "jsonwebtoken";

describe("TokenService Unit Tests", () => {
	let service: TokenService;
	const secret = "test-secret-key-for-jwt";
	const expiry = "1h";

	beforeEach(() => {
		service = new TokenService(secret, expiry);
	});

	describe("generateJwt", () => {
		it("should generate a valid JWT token", () => {
			// Arrange
			const payload = { id: 1, position: "SALES" };

			// Act
			const token = service.generateJwt(payload);

			// Assert
			expect(token).toBeDefined();
			expect(typeof token).toBe("string");
			expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
		});

		it("should include payload data in token", () => {
			// Arrange
			const payload = { id: 42, position: "MANAGER" };

			// Act
			const token = service.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.id).toBe(42);
			expect(decoded.position).toBe("MANAGER");
		});

		it("should generate different tokens for different payloads", () => {
			// Arrange
			const payload1 = { id: 1, position: "SALES" };
			const payload2 = { id: 2, position: "INVENTORY" };

			// Act
			const token1 = service.generateJwt(payload1);
			const token2 = service.generateJwt(payload2);

			// Assert
			expect(token1).not.toBe(token2);
		});

		it("should handle null position", () => {
			// Arrange
			const payload = { id: 5, position: null };

			// Act
			const token = service.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.id).toBe(5);
			expect(decoded.position).toBeNull();
		});

		it("should handle CUSTOMER position", () => {
			// Arrange
			const payload = { id: 10, position: "CUSTOMER" };

			// Act
			const token = service.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.position).toBe("CUSTOMER");
		});

		it("should include expiration time in token", () => {
			// Arrange
			const payload = { id: 1, position: "SALES" };

			// Act
			const token = service.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.exp).toBeDefined();
			expect(typeof decoded.exp).toBe("number");
		});

		it("should handle large user IDs", () => {
			// Arrange
			const payload = { id: 999999, position: "RECEIVING" };

			// Act
			const token = service.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.id).toBe(999999);
		});
	});

	describe("verifyJwt", () => {
		it("should verify a valid token", () => {
			// Arrange
			const payload = { id: 1, position: "SALES" };
			const token = service.generateJwt(payload);

			// Act
			const result = service.verifyJwt(token);

			// Assert
			expect(result).toBeDefined();
			expect((result as any).id).toBe(1);
			expect((result as any).position).toBe("SALES");
		});

		it("should throw error for invalid token signature", () => {
			// Arrange
			const wrongSecret = "wrong-secret-key";
			const wrongService = new TokenService(wrongSecret, expiry);
			const payload = { id: 1, position: "SALES" };
			const token = wrongService.generateJwt(payload);

			// Act & Assert
			expect(() => service.verifyJwt(token)).toThrow();
		});

		it("should throw error for malformed token", () => {
			// Arrange
			const malformedToken = "not.a.valid.jwt.token";

			// Act & Assert
			expect(() => service.verifyJwt(malformedToken)).toThrow();
		});

		it("should throw error for empty token", () => {
			// Act & Assert
			expect(() => service.verifyJwt("")).toThrow();
		});

		it("should verify token with null position", () => {
			// Arrange
			const payload = { id: 5, position: null };
			const token = service.generateJwt(payload);

			// Act
			const result = service.verifyJwt(token);

			// Assert
			expect((result as any).position).toBeNull();
		});

		it("should verify token with all employee positions", () => {
			// Arrange
			const positions = ["SALES", "INVENTORY", "RECEIVING", "MANAGER"];

			// Act & Assert
			positions.forEach((pos, idx) => {
				const payload = { id: idx + 1, position: pos };
				const token = service.generateJwt(payload);
				const result = service.verifyJwt(token);

				expect((result as any).position).toBe(pos);
			});
		});
	});

	describe("Token Expiration", () => {
		it("should generate token with short expiry", () => {
			// Arrange
			const shortExpiryService = new TokenService(secret, "1s");
			const payload = { id: 1, position: "SALES" };

			// Act
			const token = shortExpiryService.generateJwt(payload);
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.exp).toBeDefined();
			expect(decoded.exp - decoded.iat).toBe(1); // 1 second
		});

		it("should reject expired token", async () => {
			// Arrange
			const veryShortExpiryService = new TokenService(secret, "1s");
			const payload = { id: 1, position: "SALES" };
			const token = veryShortExpiryService.generateJwt(payload);

			// Wait for token to expire
			await new Promise((resolve) => setTimeout(resolve, 1100));

			// Act & Assert
			expect(() => veryShortExpiryService.verifyJwt(token)).toThrow();
		});
	});

	describe("Integration Scenarios", () => {
		it("should complete full token lifecycle: generate and verify", () => {
			// Arrange
			const payload = { id: 100, position: "MANAGER" };

			// Act
			const token = service.generateJwt(payload);
			const verified = service.verifyJwt(token);

			// Assert
			expect(token).toBeDefined();
			expect(verified).toBeDefined();
			expect((verified as any).id).toBe(100);
			expect((verified as any).position).toBe("MANAGER");
		});

		it("should handle customer authentication flow", () => {
			// Arrange - Customer login
			const customerPayload = { id: 50, position: null };

			// Act
			const token = service.generateJwt(customerPayload);
			const verified = service.verifyJwt(token);

			// Assert
			expect((verified as any).id).toBe(50);
			expect((verified as any).position).toBeNull();
		});

		it("should handle employee authentication flow", () => {
			// Arrange - Employee login
			const employeePayload = { id: 25, position: "INVENTORY" };

			// Act
			const token = service.generateJwt(employeePayload);
			const verified = service.verifyJwt(token);

			// Assert
			expect((verified as any).id).toBe(25);
			expect((verified as any).position).toBe("INVENTORY");
		});

		it("should reject token from different service instance", () => {
			// Arrange
			const service1 = new TokenService("secret1", "1h");
			const service2 = new TokenService("secret2", "1h");
			const payload = { id: 1, position: "SALES" };

			// Act
			const token = service1.generateJwt(payload);

			// Assert
			expect(() => service2.verifyJwt(token)).toThrow();
		});
	});

	describe("Edge Cases", () => {
		it("should handle very large user ID", () => {
			// Arrange
			const payload = { id: Number.MAX_SAFE_INTEGER, position: "SALES" };

			// Act
			const token = service.generateJwt(payload);
			const verified = service.verifyJwt(token);

			// Assert
			expect((verified as any).id).toBe(Number.MAX_SAFE_INTEGER);
		});

		it("should handle position with special characters", () => {
			// Arrange
			const payload = { id: 1, position: "POSITION_WITH_UNDERSCORE" };

			// Act
			const token = service.generateJwt(payload);
			const verified = service.verifyJwt(token);

			// Assert
			expect((verified as any).position).toBe("POSITION_WITH_UNDERSCORE");
		});

		it("should decode token without verification", () => {
			// Arrange
			const payload = { id: 99, position: "RECEIVING" };
			const token = service.generateJwt(payload);

			// Act
			const decoded = jwt.decode(token) as any;

			// Assert
			expect(decoded.id).toBe(99);
			expect(decoded.position).toBe("RECEIVING");
			expect(decoded.iat).toBeDefined(); // Issued at time
			expect(decoded.exp).toBeDefined(); // Expiration time
		});
	});
});
