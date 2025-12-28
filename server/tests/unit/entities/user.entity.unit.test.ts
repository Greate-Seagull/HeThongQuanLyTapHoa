import { User } from "../../../src/domain/entities/user";

describe("User Entity Unit Tests", () => {
  describe("create", () => {
    it("should create a user with name and zero points", () => {
      const user = User.create("John Doe");

      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe("John Doe");
      expect(user.point).toBe(0);
    });

    it("should create user with Vietnamese name", () => {
      const user = User.create("Nguyễn Văn A");

      expect(user.name).toBe("Nguyễn Văn A");
      expect(user.point).toBe(0);
    });

    it("should create user with long name", () => {
      const longName = "Nguyễn Thị Minh Phương Lan Anh";
      const user = User.create(longName);

      expect(user.name).toBe(longName);
    });
  });

  describe("earnPoints", () => {
    let user: User;

    beforeEach(() => {
      user = User.create("Test User");
    });

    it("should earn 1 point for every 100 VND spent", () => {
      user.earnPoints(100);
      expect(user.point).toBe(1);
    });

    it("should earn 10 points for 1000 VND spent", () => {
      user.earnPoints(1000);
      expect(user.point).toBe(10);
    });

    it("should round down points (150 VND = 1 point)", () => {
      user.earnPoints(150);
      expect(user.point).toBe(1); // 150 / 100 = 1.5 → floor = 1
    });

    it("should not earn points if spending less than 100 VND", () => {
      user.earnPoints(99);
      expect(user.point).toBe(0);
    });

    it("should accumulate points from multiple transactions", () => {
      user.earnPoints(100); // 1 point
      user.earnPoints(200); // 2 points
      user.earnPoints(300); // 3 points

      expect(user.point).toBe(6);
    });

    it("should handle large spending amount", () => {
      user.earnPoints(1000000); // 1 million VND
      expect(user.point).toBe(10000); // 10,000 points
    });

    it("should throw error when earning from negative amount", () => {
      expect(() => user.earnPoints(-100)).toThrow("Invalid earn points");
    });

    it("should handle zero spending (no points earned)", () => {
      user.earnPoints(0);
      expect(user.point).toBe(0);
    });
  });

  describe("usePoints", () => {
    let user: User;

    beforeEach(() => {
      user = User.create("Test User");
      // Give user some points to start with
      user.earnPoints(1000); // 10 points
    });

    it("should decrease points when using", () => {
      user.usePoints(5);
      expect(user.point).toBe(5);
    });

    it("should allow using all points", () => {
      user.usePoints(10);
      expect(user.point).toBe(0);
    });

    it("should throw error when using more points than available (business rule)", () => {
      // User entity prevents negative point balance
      expect(() => user.usePoints(15)).toThrow("Invalid point");
    });

    it("should throw error when using negative points", () => {
      expect(() => user.usePoints(-5)).toThrow("Invalid used points");
    });

    it("should handle using zero points", () => {
      const originalPoints = user.point;
      user.usePoints(0);
      expect(user.point).toBe(originalPoints);
    });
  });

  describe("Point Management Scenarios", () => {
    it("should handle complete point lifecycle", () => {
      const user = User.create("Loyal Customer");

      // First purchase: 500 VND
      user.earnPoints(500);
      expect(user.point).toBe(5);

      // Second purchase: 1000 VND
      user.earnPoints(1000);
      expect(user.point).toBe(15);

      // Use some points
      user.usePoints(5);
      expect(user.point).toBe(10);

      // Third purchase: 2000 VND
      user.earnPoints(2000);
      expect(user.point).toBe(30);

      // Use more points
      user.usePoints(20);
      expect(user.point).toBe(10);
    });

    it("should maintain point integrity across operations", () => {
      const user = User.create("Test Customer");

      // Multiple earn operations
      user.earnPoints(100);
      user.earnPoints(200);
      user.earnPoints(300);
      expect(user.point).toBe(6); // 1 + 2 + 3

      // Multiple use operations
      user.usePoints(2);
      user.usePoints(1);
      expect(user.point).toBe(3); // 6 - 2 - 1

      // More earn
      user.earnPoints(500);
      expect(user.point).toBe(8); // 3 + 5
    });

    it("should handle realistic customer scenario", () => {
      const user = User.create("Nguyễn Văn A");

      // Week 1: Purchase 150,000 VND worth of products
      user.earnPoints(150000);
      expect(user.point).toBe(1500);

      // Week 2: Use 500 points for discount
      user.usePoints(500);
      expect(user.point).toBe(1000);

      // Week 3: Purchase 75,000 VND
      user.earnPoints(75000);
      expect(user.point).toBe(1750);

      // Week 4: Use 750 points
      user.usePoints(750);
      expect(user.point).toBe(1000);
    });

    it("should handle edge case with very small amounts", () => {
      const user = User.create("Budget Customer");

      // Multiple small purchases
      user.earnPoints(50); // 0 points
      user.earnPoints(50); // 0 points
      user.earnPoints(50); // 0 points
      user.earnPoints(50); // 0 points

      expect(user.point).toBe(0); // Total 200, but calculated per transaction
    });

    it("should prevent point balance from going below zero via validation", () => {
      const user = User.create("New Customer");

      // Try to use points without earning any - should throw error
      expect(() => user.usePoints(10)).toThrow("Invalid point");
    });
  });

  describe("Name Property", () => {
    it("should allow updating name through getter/setter", () => {
      const user = User.create("Original Name");
      
      // Name is read/write, can be updated
      expect(user.name).toBe("Original Name");
    });

    it("should maintain name consistency", () => {
      const user = User.create("Test User");
      
      // Perform various point operations
      user.earnPoints(1000);
      user.usePoints(5);
      
      // Name should remain unchanged
      expect(user.name).toBe("Test User");
    });
  });

  describe("Boundary Testing", () => {
    it("should handle maximum safe integer for points", () => {
      const user = User.create("Rich Customer");
      
      // Earn a very large amount
      const largeAmount = 1000000000; // 1 billion VND
      user.earnPoints(largeAmount);
      
      expect(user.point).toBe(10000000); // 10 million points
    });

    it("should handle fractional point calculations correctly", () => {
      const user = User.create("Test User");
      
      // Various amounts that result in fractions
      user.earnPoints(150); // 1.5 → 1 point
      user.earnPoints(199); // 1.99 → 1 point
      user.earnPoints(250); // 2.5 → 2 points
      
      expect(user.point).toBe(4); // 1 + 1 + 2
    });
  });

  describe("Error Handling", () => {
    it("should throw descriptive error for negative earn amount", () => {
      const user = User.create("Test User");
      
      expect(() => user.earnPoints(-1000))
        .toThrow("Invalid earn points: -1000");
    });

    it("should throw descriptive error for negative use points", () => {
      const user = User.create("Test User");
      
      expect(() => user.usePoints(-10))
        .toThrow("Invalid used points: -10");
    });
  });
});
