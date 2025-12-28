/**
 * Test Helper Utilities
 * Common utilities and builders for testing
 */

import { Product, ProductUnit } from "../../src/domain/entities/product";
import { User } from "../../src/domain/entities/user";
import { Promotion, PromotionType } from "../../src/domain/entities/promotion";

/**
 * Builder pattern for Product entity
 */
export class ProductBuilder {
  private id: number | null = null;
  private name: string = "Test Product";
  private price: number = 10000;
  private unit: ProductUnit = ProductUnit.PIECE;
  private amount: number = 100;
  private barcode: number | null = null;
  private categoryId: number | null = null;
  private supplierId: number | null = null;

  withId(id: number): this {
    this.id = id;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withPrice(price: number): this {
    this.price = price;
    return this;
  }

  withUnit(unit: ProductUnit): this {
    this.unit = unit;
    return this;
  }

  withAmount(amount: number): this {
    this.amount = amount;
    return this;
  }

  withBarcode(barcode: number): this {
    this.barcode = barcode;
    return this;
  }

  withCategory(categoryId: number): this {
    this.categoryId = categoryId;
    return this;
  }

  withSupplier(supplierId: number): this {
    this.supplierId = supplierId;
    return this;
  }

  build(): Product {
    const product = Product.create({
      name: this.name,
      price: this.price,
      unit: this.unit,
      amount: this.amount,
      barcode: this.barcode,
      categoryId: this.categoryId,
      supplierId: this.supplierId,
    });

    if (this.id !== null) {
      (product as any)._id = this.id;
    }

    return product;
  }
}

/**
 * Builder pattern for User entity
 */
export class UserBuilder {
  private id: number | null = null;
  private name: string = "Test User";
  private point: number = 0;

  withId(id: number): this {
    this.id = id;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withPoints(point: number): this {
    this.point = point;
    return this;
  }

  build(): User {
    const user = User.create(this.name);
    
    if (this.id !== null) {
      (user as any)._id = this.id;
    }

    // Set points if specified
    if (this.point > 0) {
      user.earnPoints(this.point * 100); // Convert points back to spending amount
    }

    return user;
  }
}

/**
 * Builder pattern for Promotion entity
 */
export class PromotionBuilder {
  private id: number | null = null;
  private name: string = "Test Promotion";
  private description: string = "Test Description";
  private startedAt: Date = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
  private endedAt: Date = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  private value: number = 10;
  private promotionType: PromotionType = PromotionType.PERCENTAGE;
  private productIds: number[] = [1];

  withId(id: number): this {
    this.id = id;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withDates(startedAt: Date, endedAt: Date): this {
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    return this;
  }

  withValue(value: number): this {
    this.value = value;
    return this;
  }

  withType(type: PromotionType): this {
    this.promotionType = type;
    return this;
  }

  withProducts(productIds: number[]): this {
    this.productIds = productIds;
    return this;
  }

  build(): Promotion {
    const promotion = Promotion.create(
      this.name,
      this.startedAt,
      this.endedAt,
      this.value,
      this.promotionType,
      this.productIds,
      this.description
    );

    if (this.id !== null) {
      (promotion as any)._id = this.id;
    }

    return promotion;
  }
}

/**
 * Date utilities for testing
 */
export const DateHelpers = {
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  tomorrow: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  lastWeek: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  nextWeek: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  daysAgo: (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  daysFromNow: (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000),
};

/**
 * Mock factory for repositories
 */
export const createMockRepository = <T = any>() => ({
  add: jest.fn<Promise<T>, [T]>(),
  getByIds: jest.fn<Promise<T[]>, [number[]]>(),
  update: jest.fn<Promise<T>, [T]>(),
  delete: jest.fn<Promise<void>, [number]>(),
});

/**
 * Mock factory for read accessors
 */
export const createMockReadAccessor = <T = any>() => ({
  getById: jest.fn<Promise<T | null>, [number]>(),
  getAll: jest.fn<Promise<T[]>, []>(),
});

/**
 * Async test helpers
 */
export const AsyncHelpers = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  expectAsync: async <T>(promise: Promise<T>, assertion: (result: T) => void) => {
    const result = await promise;
    assertion(result);
  },

  expectAsyncError: async <T>(promise: Promise<T>, expectedError?: string | RegExp) => {
    await expect(promise).rejects.toThrow(expectedError);
  },
};

/**
 * Common test data
 */
export const TestData = {
  products: {
    cocaCola: {
      name: "Coca Cola 330ml",
      price: 12000,
      unit: ProductUnit.BOTTLE,
      amount: 100,
      barcode: 8934567890123,
    },
    miGoi: {
      name: "Mì gói Hảo Hảo",
      price: 3000,
      unit: ProductUnit.PACKAGE,
      amount: 200,
      barcode: 8934563141000,
    },
    suaTuoi: {
      name: "Sữa tươi Vinamilk 1L",
      price: 32000,
      unit: ProductUnit.BOTTLE,
      amount: 50,
    },
  },

  users: {
    regular: {
      name: "Nguyễn Văn A",
      point: 100,
    },
    vip: {
      name: "Trần Thị B",
      point: 1000,
    },
    new: {
      name: "Lê Văn C",
      point: 0,
    },
  },

  promotions: {
    percentage10: {
      name: "Giảm 10%",
      value: 10,
      type: PromotionType.PERCENTAGE,
    },
    fixed5k: {
      name: "Giảm 5,000đ",
      value: 5000,
      type: PromotionType.FIXED,
    },
  },
};

/**
 * Assertion helpers
 */
export const CustomMatchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within range ${floor} - ${ceiling}`
          : `Expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },

  toBePositive(received: number) {
    const pass = received > 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be positive`
          : `Expected ${received} to be positive`,
    };
  },
};

/**
 * Convenience helper functions for quick entity creation
 */
import { Employee, EmployeePosition } from "../../src/domain/entities/employee";

export function buildProduct(overrides: Partial<{
  id: number;
  name: string;
  price: number;
  unit: ProductUnit;
  amount: number;
  barcode: number | null;
  categoryId: number | null;
  supplierId: number | null;
}> = {}): Product {
  const builder = new ProductBuilder();
  if (overrides.id !== undefined) builder.withId(overrides.id);
  if (overrides.name) builder.withName(overrides.name);
  if (overrides.price !== undefined) builder.withPrice(overrides.price);
  if (overrides.unit) builder.withUnit(overrides.unit);
  if (overrides.amount !== undefined) builder.withAmount(overrides.amount);
  if (overrides.barcode !== undefined) builder.withBarcode(overrides.barcode);
  else builder.withBarcode(Math.floor(Math.random() * 1000000000) + 1000000000); // Default random barcode
  if (overrides.categoryId !== undefined) builder.withCategory(overrides.categoryId);
  if (overrides.supplierId !== undefined) builder.withSupplier(overrides.supplierId);
  return builder.build();
}

export function buildUser(overrides: Partial<{
  id: number;
  name: string;
  point: number;
}> = {}): User {
  const builder = new UserBuilder();
  if (overrides.id !== undefined) builder.withId(overrides.id);
  if (overrides.name) builder.withName(overrides.name);
  if (overrides.point !== undefined) builder.withPoints(overrides.point);
  return builder.build();
}

export function buildPromotion(overrides: Partial<{
  id: number;
  name: string;
  description: string;
  startedAt: Date;
  endedAt: Date;
  value: number;
  promotionType: PromotionType;
  productIds: number[];
}> = {}): Promotion {
  const builder = new PromotionBuilder();
  if (overrides.id !== undefined) builder.withId(overrides.id);
  if (overrides.name) builder.withName(overrides.name);
  if (overrides.description) builder.withDescription(overrides.description);
  if (overrides.startedAt && overrides.endedAt) builder.withDates(overrides.startedAt, overrides.endedAt);
  if (overrides.value !== undefined) builder.withValue(overrides.value);
  if (overrides.promotionType) builder.withType(overrides.promotionType);
  if (overrides.productIds) builder.withProducts(overrides.productIds);
  return builder.build();
}

export function buildEmployee(overrides: Partial<{
  id: number;
  name: string;
  position: EmployeePosition;
}> = {}): Employee {
  const employee = Employee.create(
    overrides.name || "Test Employee",
    overrides.position || EmployeePosition.SALES
  );
  if (overrides.id !== undefined) {
    (employee as any)._id = overrides.id;
  }
  return employee;
}
