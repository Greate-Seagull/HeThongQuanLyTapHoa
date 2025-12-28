import { SearchProductsUsecase } from "../../../src/application/services/product/search-products.usecase";

describe("SearchProductsUsecase Unit Tests", () => {
  let usecase: SearchProductsUsecase;
  let mockProductRead: any;
  let mockPromotionRepo: any;
  let mockPromotionPricingService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductRead = {
      getProductIncludePromotionId: jest.fn(),
    };

    mockPromotionRepo = {
      getByIds: jest.fn(),
    };

    mockPromotionPricingService = {
      getBestPromotion: jest.fn(),
    };

    usecase = new SearchProductsUsecase(
      mockProductRead,
      mockPromotionRepo,
      mockPromotionPricingService
    );
  });

  describe("Success Cases", () => {
    it("should retrieve product with promotions successfully", async () => {
      const product = {
        id: 1,
        name: "Coca Cola",
        price: 15000,
        unit: "bottle",
        promotionDetails: [
          { promotionId: 1 },
          { promotionId: 2 },
        ],
      };

      const promotions = [
        { id: 1, name: "Summer Sale", value: 2000, promotionType: "FIXED" },
        { id: 2, name: "Bulk", value: 10, promotionType: "PERCENTAGE" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[0]);

      const result = await usecase.execute({ productId: 1 });

      expect(result).toBeDefined();
      expect(result.product.id).toBe(1);
      expect(result.promotion).toBeDefined();
    });

    it("should handle product without promotions", async () => {
      const product = {
        id: 2,
        name: "Water",
        price: 5000,
        unit: "bottle",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 2 });

      expect(result).toBeDefined();
      expect(result.promotion).toBeNull();
    });

    it("should apply best promotion from multiple options", async () => {
      const product = {
        id: 3,
        name: "Premium Product",
        price: 100000,
        unit: "box",
        promotionDetails: [
          { promotionId: 1 },
          { promotionId: 2 },
          { promotionId: 3 },
        ],
      };

      const promotions = [
        { id: 1, name: "Promo 1", value: 5000, promotionType: "FIXED" },
        { id: 2, name: "Promo 2", value: 15, promotionType: "PERCENTAGE" },
        { id: 3, name: "Promo 3", value: 10000, promotionType: "FIXED" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[2]); // Best = 10000 discount

      const result = await usecase.execute({ productId: 3 });

      expect(result).toBeDefined();
      expect(result.promotion.id).toBe(3);
      expect(result.promotion.value).toBe(10000);
    });

    it("should include all product fields in result", async () => {
      const product = {
        id: 4,
        name: "Full Product",
        price: 50000,
        unit: "box",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 4 });

      expect(result.product.id).toBe(4);
      expect(result.product.name).toBe("Full Product");
      expect(result.product.price).toBe(50000);
      expect(result.product.unit).toBe("box");
    });

    it("should handle large product IDs", async () => {
      const product = {
        id: 999999,
        name: "Test Product",
        price: 50000,
        unit: "piece",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 999999 });

      expect(result).toBeDefined();
      expect(result.product.id).toBe(999999);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when productId is missing", async () => {
      await expect(usecase.execute({})).rejects.toThrow();
    });

    it("should throw error when productId is zero", async () => {
      await expect(usecase.execute({ productId: 0 })).rejects.toThrow();
    });

    it("should throw error when productId is negative", async () => {
      await expect(usecase.execute({ productId: -5 })).rejects.toThrow();
    });

    it("should throw error when productId is not a number", async () => {
      await expect(usecase.execute({ productId: "invalid" })).rejects.toThrow();
    });

    it("should throw error when productId is null", async () => {
      await expect(usecase.execute({ productId: null })).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should call getProductIncludePromotionId with correct productId", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      await usecase.execute({ productId: 1 });

      expect(mockProductRead.getProductIncludePromotionId).toHaveBeenCalledWith(1);
    });

    it("should fetch promotions by IDs from promotionDetails", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [
          { promotionId: 5 },
          { promotionId: 10 },
        ],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([
        { id: 5, name: "Promo 5", value: 1000, promotionType: "FIXED" },
      ]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      await usecase.execute({ productId: 1 });

      expect(mockPromotionRepo.getByIds).toHaveBeenCalledWith([5, 10]);
    });

    it("should call getBestPromotion with fetched promotions", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 50000,
        unit: "piece",
        promotionDetails: [{ promotionId: 1 }],
      };

      const promotions = [
        { id: 1, name: "Promo", value: 5000, promotionType: "FIXED" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[0]);

      await usecase.execute({ productId: 1 });

      expect(mockPromotionPricingService.getBestPromotion).toHaveBeenCalledWith(
        promotions,
        50000
      );
    });

    it("should not fetch promotions when promotionDetails is empty", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      await usecase.execute({ productId: 1 });

      expect(mockPromotionRepo.getByIds).toHaveBeenCalledWith([]);
    });

    it("should handle null promotion when no best promotion found", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [{ promotionId: 1 }],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([
        { id: 1, name: "Promo", value: 100, promotionType: "FIXED" },
      ]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 1 });

      expect(result.promotion).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle product with Vietnamese name", async () => {
      const product = {
        id: 1,
        name: "Sữa tươi Việt",
        price: 30000,
        unit: "hộp",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 1 });

      expect(result.product.name).toBe("Sữa tươi Việt");
      expect(result.product.unit).toBe("hộp");
    });

    it("should handle very high product price", async () => {
      const product = {
        id: 1,
        name: "Expensive Item",
        price: 10000000,
        unit: "piece",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 1 });

      expect(result.product.price).toBe(10000000);
    });

    it("should handle product with very low price", async () => {
      const product = {
        id: 1,
        name: "Cheap Item",
        price: 100,
        unit: "piece",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const result = await usecase.execute({ productId: 1 });

      expect(result.product.price).toBe(100);
    });

    it("should handle promotion with zero value", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [{ promotionId: 1 }],
      };

      const promotions = [
        { id: 1, name: "No Discount", value: 0, promotionType: "FIXED" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[0]);

      const result = await usecase.execute({ productId: 1 });

      expect(result.promotion.value).toBe(0);
    });

    it("should handle percentage type promotion", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 100000,
        unit: "box",
        promotionDetails: [{ promotionId: 1 }],
      };

      const promotions = [
        { id: 1, name: "Discount 20%", value: 20, promotionType: "PERCENTAGE" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[0]);

      const result = await usecase.execute({ productId: 1 });

      expect(result.promotion.type).toBe("PERCENTAGE");
    });

    it("should handle database error gracefully", async () => {
      mockProductRead.getProductIncludePromotionId.mockRejectedValue(
        new Error("Database error")
      );

      await expect(usecase.execute({ productId: 1 })).rejects.toThrow();
    });

    it("should handle product not found error", async () => {
      mockProductRead.getProductIncludePromotionId.mockResolvedValue(null);

      await expect(usecase.execute({ productId: 999 })).rejects.toThrow(
        "Invalid product id"
      );
    });

    it("should handle promotion repository error", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [{ promotionId: 1 }],
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockRejectedValue(
        new Error("Promotion fetch error")
      );

      await expect(usecase.execute({ productId: 1 })).rejects.toThrow();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle product with many promotions (10+)", async () => {
      const promotionDetails = Array.from({ length: 15 }, (_, i) => ({
        promotionId: i + 1,
      }));

      const product = {
        id: 1,
        name: "Popular Product",
        price: 50000,
        unit: "box",
        promotionDetails,
      };

      const promotions = promotionDetails.map((pd, i) => ({
        id: pd.promotionId,
        name: `Promo ${i + 1}`,
        value: 1000 * (i + 1),
        promotionType: i % 2 === 0 ? "FIXED" : "PERCENTAGE",
      }));

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[14]); // Highest value

      const result = await usecase.execute({ productId: 1 });

      expect(result).toBeDefined();
      expect(result.promotion.value).toBe(15000);
    });

    it("should apply fixed promotion with correct format", async () => {
      const product = {
        id: 1,
        name: "Discounted Product",
        price: 50000,
        unit: "box",
        promotionDetails: [{ promotionId: 1 }],
      };

      const promotion = {
        id: 1,
        name: "Flash Sale",
        value: 5000,
        promotionType: "FIXED",
      };

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue([promotion]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotion);

      const result = await usecase.execute({ productId: 1 });

      expect(result.product.price).toBe(50000);
      expect(result.promotion.value).toBe(5000);
      expect(result.promotion.type).toBe("FIXED");
    });

    it("should log all retrieval information", async () => {
      const product = {
        id: 1,
        name: "Test",
        price: 10000,
        unit: "piece",
        promotionDetails: [{ promotionId: 1 }],
      };

      const promotions = [
        { id: 1, name: "Promo", value: 1000, promotionType: "FIXED" },
      ];

      mockProductRead.getProductIncludePromotionId.mockResolvedValue(product);
      mockPromotionRepo.getByIds.mockResolvedValue(promotions);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(promotions[0]);

      const result = await usecase.execute({ productId: 1 });

      expect(result).toBeDefined();
      expect(mockProductRead.getProductIncludePromotionId).toHaveBeenCalled();
      expect(mockPromotionRepo.getByIds).toHaveBeenCalled();
    });

    it("should handle multiple concurrent searches", async () => {
      const product1 = {
        id: 1,
        name: "P1",
        price: 10000,
        unit: "box",
        promotionDetails: [],
      };

      const product2 = {
        id: 2,
        name: "P2",
        price: 20000,
        unit: "bottle",
        promotionDetails: [],
      };

      mockProductRead.getProductIncludePromotionId
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      mockPromotionRepo.getByIds.mockResolvedValue([]);
      mockPromotionPricingService.getBestPromotion.mockReturnValue(null);

      const search1 = usecase.execute({ productId: 1 });
      const search2 = usecase.execute({ productId: 2 });

      const results = await Promise.all([search1, search2]);

      expect(results[0].product.id).toBe(1);
      expect(results[1].product.id).toBe(2);
    });
  });
});
