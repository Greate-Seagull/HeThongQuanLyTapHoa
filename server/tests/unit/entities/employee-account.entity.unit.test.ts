import { EmployeeAccount } from "../../../src/domain/entities/employee-account";

describe("EmployeeAccount Entity Unit Tests", () => {
  describe("create", () => {
    it("should create employee account with valid data", () => {
      const account = EmployeeAccount.create(
        "employee001",
        "hashedPassword123",
        "salt123",
        1
      );

      expect(account.username).toBe("employee001");
      expect(account.passwordHash).toBe("hashedPassword123");
      expect(account.salt).toBe("salt123");
      expect(account.employeeId).toBe(1);
      expect(account.loggedAt).toBeInstanceOf(Date);
    });

    it("should throw error when employeeId is negative", () => {
      expect(() =>
        EmployeeAccount.create(
          "test",
          "hash",
          "salt",
          -1
        )
      ).toThrow("Invalid id");
    });

    it("should set loggedAt when created", () => {
      const before = new Date();
      const account = EmployeeAccount.create("test", "hash", "salt", 1);
      const after = new Date();

      expect(account.loggedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(account.loggedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("signIn", () => {
    it("should update loggedAt when signing in", async () => {
      const account = EmployeeAccount.create("test", "hash", "salt", 1);
      const oldLoggedAt = account.loggedAt;

      // Wait 10ms to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      account.signIn();

      expect(account.loggedAt.getTime()).toBeGreaterThan(
        oldLoggedAt.getTime()
      );
    });
  });

  describe("updateUsername", () => {
    it("should update username", () => {
      const account = EmployeeAccount.create("oldUsername", "hash", "salt", 1);

      account.updateUsername("newUsername");

      expect(account.username).toBe("newUsername");
    });

    it("should not affect other fields when updating username", () => {
      const account = EmployeeAccount.create("oldUsername", "hash", "salt", 5);

      account.updateUsername("newUsername");

      expect(account.passwordHash).toBe("hash");
      expect(account.employeeId).toBe(5);
    });
  });

  describe("business scenarios", () => {
    it("should handle employee login scenario", () => {
      const account = EmployeeAccount.create(
        "cashier001",
        "hashedPass",
        "salt",
        10
      );

      expect(account.username).toBe("cashier001");
      expect(account.loggedAt).toBeInstanceOf(Date);
    });

    it("should handle multiple sign-ins", async () => {
      const account = EmployeeAccount.create("test", "hash", "salt", 1);
      const firstLogin = account.loggedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      account.signIn();
      const secondLogin = account.loggedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      account.signIn();
      const thirdLogin = account.loggedAt;

      expect(secondLogin.getTime()).toBeGreaterThan(firstLogin.getTime());
      expect(thirdLogin.getTime()).toBeGreaterThan(secondLogin.getTime());
    });
  });

  describe("data integrity", () => {
    it("should maintain data consistency", () => {
      const account = EmployeeAccount.create(
        "testUser",
        "testHash",
        "testSalt",
        15
      );

      expect(account.username).toBe("testUser");
      expect(account.passwordHash).toBe("testHash");
      expect(account.salt).toBe("testSalt");
      expect(account.employeeId).toBe(15);
    });
  });
});
