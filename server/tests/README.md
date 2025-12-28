# Tests Directory

## 📁 Cấu trúc

```
tests/
├── unit/                   # Unit tests
│   ├── entities/          # Tests cho domain entities
│   ├── usecases/          # Tests cho use cases
│   └── services/          # Tests cho domain services
├── integration/           # Integration tests
│   ├── create-invoice/
│   ├── create-product/
│   └── ...
└── setup.ts              # Jest setup file
```

## 🚀 Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy chỉ unit tests
```bash
npm test -- tests/unit
```

### Chạy chỉ integration tests
```bash
npm test -- tests/integration
```

### Chạy một file test cụ thể
```bash
npm test -- tests/unit/entities/product.entity.unit.test.ts
```

### Chạy với coverage
```bash
npm test -- --coverage
```

### Watch mode
```bash
npm test -- --watch
```

### Chạy tests match pattern
```bash
npm test -- --testNamePattern="should create"
```

## 📊 Coverage Reports

Sau khi chạy với `--coverage`, báo cáo sẽ được tạo trong thư mục `coverage/`:

- **HTML Report**: `coverage/lcov-report/index.html` - Mở trong browser để xem chi tiết
- **Text Summary**: Hiển thị trong terminal
- **LCOV**: `coverage/lcov.info` - Cho CI/CD tools

## 📝 Quy tắc Viết Tests

### 1. Naming Convention

**File names:**
- Unit tests: `<filename>.unit.test.ts`
- Integration tests: `<feature>.integration.test.ts`

**Test descriptions:**
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // test
    });
  });
});
```

### 2. Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange - Setup
  const input = { ... };
  const expected = { ... };

  // Act - Execute
  const result = someFunction(input);

  // Assert - Verify
  expect(result).toEqual(expected);
});
```

### 3. Mock Dependencies

```typescript
const mockRepo = {
  add: jest.fn(),
  getByIds: jest.fn(),
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. Test Coverage Goals

Mục tiêu coverage cho từng loại file:

- **Entities**: > 90% (logic đơn giản, dễ test)
- **Use Cases**: > 80% (có nhiều edge cases)
- **Services**: > 85% (business logic quan trọng)
- **Controllers**: > 70% (đã có integration tests)

## 🔍 Debug Tests

### Trong VS Code

1. Thêm breakpoint trong test
2. Click "Debug Test" trong gutter
3. Hoặc dùng launch configuration (xem `.vscode/launch.json`)

### Console logging

```typescript
it('should debug something', () => {
  console.log('Debug info:', someValue);
  // test continues...
});
```

## 🧪 Test Examples

### Entity Test Example
```typescript
describe('Product Entity', () => {
  it('should create product with valid data', () => {
    const product = Product.create({
      name: 'Test',
      price: 10000,
      unit: ProductUnit.PIECE,
    });

    expect(product).toBeInstanceOf(Product);
    expect(product.name).toBe('Test');
  });
});
```

### Use Case Test Example
```typescript
describe('CreateProductUsecase', () => {
  let usecase: CreateProductUsecase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = { add: jest.fn() };
    usecase = new CreateProductUsecase(mockRepo);
  });

  it('should create product successfully', async () => {
    mockRepo.add.mockResolvedValue({ id: 1 });

    const result = await usecase.execute({
      name: 'Test',
      price: 10000,
    });

    expect(result.productId).toBe(1);
    expect(mockRepo.add).toHaveBeenCalledTimes(1);
  });
});
```

### Service Test Example
```typescript
describe('PromotionPricingService', () => {
  let service: PromotionPricingService;

  beforeEach(() => {
    service = new PromotionPricingService();
  });

  it('should return best promotion', () => {
    const promotions = [...];
    const result = service.getBestPromotion(promotions, 100000);

    expect(result).toBeDefined();
    expect(result.value).toBeGreaterThan(0);
  });
});
```

## 📚 Tài liệu bổ sung

- [Hướng dẫn Unit Testing chi tiết](../docs/unit-testing-guide.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🐛 Troubleshooting

### Test timeout
```typescript
jest.setTimeout(50000); // trong beforeAll hoặc beforeEach
```

### Module not found
Kiểm tra `moduleNameMapper` trong `jest.config.js`

### Mock không hoạt động
```typescript
jest.clearAllMocks(); // trong beforeEach
```

### TypeScript errors
Kiểm tra `tsconfig.json` và đảm bảo types được install

## 📈 CI/CD Integration

Tests sẽ tự động chạy trong GitHub Actions (xem `.github/workflows/ci.yaml`):

```yaml
- name: Run tests
  run: npm test -- --coverage --ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## ✅ Checklist trước khi commit

- [ ] Tất cả tests pass
- [ ] Coverage không giảm
- [ ] Không có test bị skip (`.skip()`)
- [ ] Không có console.log trong production code
- [ ] Mocks được clear properly
