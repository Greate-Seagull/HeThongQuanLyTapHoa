import { Shelf } from "../../../src/domain/entities/shelf";

describe("Shelf Entity Unit Tests", () => {
  describe("create", () => {
    it("should create shelf with valid name", () => {
      const shelf = Shelf.create({ name: "Shelf A" });

      expect(shelf.name).toBe("Shelf A");
    });

    it("should throw error when name is empty", () => {
      expect(() => Shelf.create({ name: "" })).toThrow("Name cannot be empty");
    });

    it("should throw error when name is null (factory service validates)", () => {
      expect(() => Shelf.create({ name: null })).toThrow("Missing required field");
    });

    it("should handle long shelf names", () => {
      const longName = "Shelf A - Electronics Section - Floor 1";
      const shelf = Shelf.create({ name: longName });

      expect(shelf.name).toBe(longName);
    });

    it("should handle Vietnamese shelf names", () => {
      const shelf = Shelf.create({ name: "Kệ Đồ Ăn Nhẹ" });

      expect(shelf.name).toBe("Kệ Đồ Ăn Nhẹ");
    });
  });

  describe("update", () => {
    it("should update shelf name", () => {
      const shelf = Shelf.create({ name: "Old Name" });

      shelf.update({ name: "New Name" });

      expect(shelf.name).toBe("New Name");
    });

    it("should throw error when updating to empty name", () => {
      const shelf = Shelf.create({ name: "Valid Name" });

      expect(() => shelf.update({ name: "" })).toThrow("Name cannot be empty");
    });

    it("should not update if name is undefined", () => {
      const shelf = Shelf.create({ name: "Original Name" });

      shelf.update({ name: undefined });

      expect(shelf.name).toBe("Original Name");
    });
  });

  describe("business scenarios", () => {
    it("should handle grocery section shelves", () => {
      const shelf1 = Shelf.create({ name: "Beverages" });
      const shelf2 = Shelf.create({ name: "Snacks" });
      const shelf3 = Shelf.create({ name: "Fresh Produce" });

      expect(shelf1.name).toBe("Beverages");
      expect(shelf2.name).toBe("Snacks");
      expect(shelf3.name).toBe("Fresh Produce");
    });

    it("should handle shelf reorganization", () => {
      const shelf = Shelf.create({ name: "Section A" });

      shelf.update({ name: "Section A - Upgraded" });

      expect(shelf.name).toBe("Section A - Upgraded");
    });
  });

  describe("data integrity", () => {
    it("should maintain name after creation", () => {
      const shelf = Shelf.create({ name: "Test Shelf" });

      expect(shelf.name).toBe("Test Shelf");
    });
  });
});
