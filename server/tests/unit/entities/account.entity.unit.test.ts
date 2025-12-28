import { Account } from "../../../src/domain/entities/account";

describe("Account Entity Unit Tests", () => {
  describe("create", () => {
    it("should create account with valid data", () => {
      const account = Account.create(
        "0901234567",
        "hashedPassword123",
        "salt123",
        1
      );

      expect(account.phoneNumber).toBe("0901234567");
      expect(account.passwordHash).toBe("hashedPassword123");
      expect(account.salt).toBe("salt123");
      expect(account.userId).toBe(1);
      expect(account.loggedAt).toBeInstanceOf(Date);
    });

    it("should throw error when userId is negative", () => {
      expect(() =>
        Account.create("0901234567", "hash", "salt", -1)
      ).toThrow("Invalid id");
    });

    it("should set loggedAt when created", () => {
      const before = new Date();
      const account = Account.create("0901234567", "hash", "salt", 1);
      const after = new Date();

      expect(account.loggedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(account.loggedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should handle Vietnamese phone number format", () => {
      const account = Account.create("0909123456", "hash", "salt", 1);

      expect(account.phoneNumber).toBe("0909123456");
    });
  });

  describe("signIn", () => {
    it("should update loggedAt when signing in", async () => {
      const account = Account.create("0901234567", "hash", "salt", 1);
      const oldLoggedAt = account.loggedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      account.signIn();

      expect(account.loggedAt.getTime()).toBeGreaterThan(
        oldLoggedAt.getTime()
      );
    });
  });

  describe("business scenarios", () => {
    it("should handle customer registration", () => {
      const account = Account.create(
        "0901234567",
        "secureHash",
        "randomSalt",
        100
      );

      expect(account.phoneNumber).toBe("0901234567");
      expect(account.userId).toBe(100);
    });

    it("should handle multiple sign-ins", async () => {
      const account = Account.create("0901234567", "hash", "salt", 1);
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

    it("should handle different phone number formats", () => {
      const account1 = Account.create("0901234567", "h1", "s1", 1);
      const account2 = Account.create("0909876543", "h2", "s2", 2);

      expect(account1.phoneNumber).not.toBe(account2.phoneNumber);
    });
  });

  describe("data integrity", () => {
    it("should maintain data consistency", () => {
      const account = Account.create(
        "0901234567",
        "testHash",
        "testSalt",
        15
      );

      expect(account.phoneNumber).toBe("0901234567");
      expect(account.passwordHash).toBe("testHash");
      expect(account.salt).toBe("testSalt");
      expect(account.userId).toBe(15);
    });
  });
});
