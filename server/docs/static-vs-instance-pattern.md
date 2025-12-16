# Static vs Instance Pattern: Why Static is Preferred

## Quick Answer

**Static properties are preferred for `baseQuery` because:**
1. ✅ **Performance** - Computed once, not per instance
2. ✅ **Memory efficiency** - Shared across all instances
3. ✅ **Immutability** - The query doesn't change per instance
4. ✅ **Simplicity** - Cleaner, more readable code
5. ✅ **Your codebase already uses it** - Consistency matters

---

## Detailed Comparison

### Pattern 1: Static Property (Recommended)

```typescript
export class UserRepository extends PrismaRepository<User> {
  // ✅ Computed ONCE when the module loads
  static baseQuery = buildSafePrismaSelect(User);
  
  constructor(prisma: PrismaClient) {
    super(prisma, User);
  }
  
  async getById(id: string) {
    const raw = await this.client.user.findUnique({
      where: { id },
      ...UserRepository.baseQuery, // ✅ Access via class name
    });
    return this.buildAndTrackEntity(raw);
  }
}
```

**When the query is built:**
```
Module Load Time (once)
    ↓
buildSafePrismaSelect(User) executes
    ↓
Result stored in UserRepository.baseQuery
    ↓
All instances share the same query object
```

### Pattern 2: Instance Method (Alternative)

```typescript
export class UserRepository extends PrismaRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, User);
  }
  
  async getById(id: string) {
    // ❌ Method call on every query
    const select = this.getBaseSelect();
    
    const raw = await this.client.user.findUnique({
      where: { id },
      ...select,
    });
    return this.buildAndTrackEntity(raw);
  }
}
```

**When the query is built:**
```
Every time you call getById()
    ↓
this.getBaseSelect() executes
    ↓
buildSafePrismaSelect(User) executes
    ↓
New query object created (or returned from cache)
```

---

## Performance Comparison

### Scenario: 1000 User Queries

#### Static Pattern
```typescript
// Module load (happens once)
static baseQuery = buildSafePrismaSelect(User); // 1 execution

// Runtime (1000 queries)
for (let i = 0; i < 1000; i++) {
  await repo.getById(userId);
  // UserRepository.baseQuery is reused 1000 times
}

// Total buildSafePrismaSelect calls: 1
```

#### Instance Method Pattern
```typescript
// Runtime (1000 queries)
for (let i = 0; i < 1000; i++) {
  await repo.getById(userId);
  // this.getBaseSelect() called 1000 times
  // buildSafePrismaSelect() called 1000 times (unless cached)
}

// Total buildSafePrismaSelect calls: 1000 (or 1 if cached)
```

### Benchmark Results (Hypothetical)

```
Operation: 1000 sequential queries

Static Pattern:
  - Query building time: ~5ms (once)
  - Total overhead: ~5ms
  - Memory: 1 query object

Instance Method Pattern (no cache):
  - Query building time: ~5ms × 1000 = 5000ms
  - Total overhead: ~5000ms
  - Memory: 1000 query objects (garbage collected)

Instance Method Pattern (with cache):
  - Query building time: ~5ms (once) + ~0.1ms × 1000 (cache lookups)
  - Total overhead: ~105ms
  - Memory: 1 query object + cache overhead
```

---

## Memory Comparison

### Static Pattern

```typescript
// In memory:
UserRepository.baseQuery → { select: { id: true, name: true, ... } }
                            ↑
                            │
                            └─── All instances point here

const repo1 = new UserRepository(prisma);
const repo2 = new UserRepository(prisma);
const repo3 = new UserRepository(prisma);

// Memory usage: 1 query object (shared)
```

### Instance Method Pattern

```typescript
// In memory (without caching):
repo1.getBaseSelect() → creates new object → garbage collected
repo2.getBaseSelect() → creates new object → garbage collected
repo3.getBaseSelect() → creates new object → garbage collected

// Memory usage: Temporary objects created and destroyed
// GC pressure: Higher
```

---

## Code Readability Comparison

### Static: Clear Intent

```typescript
async getById(id: string) {
  const raw = await this.client.user.findUnique({
    where: { id },
    ...UserRepository.baseQuery, // ✅ Clear: "use the standard query"
  });
  return this.buildAndTrackEntity(raw);
}

async getAll() {
  const rawList = await this.client.user.findMany({
    ...UserRepository.baseQuery, // ✅ Same pattern, consistent
  });
  return rawList.map(raw => this.buildAndTrackEntity(raw));
}
```

### Instance Method: Extra Boilerplate

```typescript
async getById(id: string) {
  const select = this.getBaseSelect(); // ❌ Extra line
  
  const raw = await this.client.user.findUnique({
    where: { id },
    ...select, // ❓ What is "select"? Need to look up
  });
  return this.buildAndTrackEntity(raw);
}

async getAll() {
  const select = this.getBaseSelect(); // ❌ Repeated boilerplate
  
  const rawList = await this.client.user.findMany({
    ...select,
  });
  return rawList.map(raw => this.buildAndTrackEntity(raw));
}
```

---

## When to Use Each Pattern

### ✅ Use Static When:

1. **The query is the same for all instances** (most cases)
   ```typescript
   // Every UserRepository instance needs the same base query
   static baseQuery = buildSafePrismaSelect(User);
   ```

2. **Performance matters**
   ```typescript
   // High-traffic endpoint
   async getPopularUsers() {
     return this.client.user.findMany({
       ...UserRepository.baseQuery, // ✅ Zero overhead
       orderBy: { followers: 'desc' },
       take: 100,
     });
   }
   ```

3. **You want immutability**
   ```typescript
   // Query can't be accidentally modified per instance
   static readonly baseQuery = buildSafePrismaSelect(User);
   ```

### ⚠️ Use Instance Method When:

1. **The query varies per instance** (rare)
   ```typescript
   class TenantUserRepository extends PrismaRepository<User> {
     constructor(
       prisma: PrismaClient,
       private tenantId: string,
       private includeArchived: boolean
     ) {
       super(prisma, User);
     }
     
     protected getBaseSelect() {
       const base = super.getBaseSelect();
       
       // Modify query based on instance configuration
       if (this.includeArchived) {
         return {
           ...base,
           where: { tenantId: this.tenantId }
         };
       }
       
       return base;
     }
   }
   ```

2. **You need runtime configuration**
   ```typescript
   class ConfigurableRepository extends PrismaRepository<User> {
     private selectFields: string[] = [];
     
     setSelectFields(fields: string[]) {
       this.selectFields = fields;
     }
     
     protected getBaseSelect() {
       // Build query based on runtime state
       const select = {};
       for (const field of this.selectFields) {
         select[field] = true;
       }
       return { select };
     }
   }
   ```

3. **You need lazy initialization**
   ```typescript
   class LazyRepository extends PrismaRepository<User> {
     private _baseQuery: any = null;
     
     protected getBaseSelect() {
       // Only build when first needed
       if (!this._baseQuery) {
         this._baseQuery = buildSafePrismaSelect(this.entityClass);
       }
       return this._baseQuery;
     }
   }
   ```

---

## Your Codebase Pattern

Looking at your existing repositories, **they ALL use static**:

```typescript
// account.repository.ts
export class AccountRepository {
  static baseQuery = buildSafePrismaSelect(Account); // ✅
}

// employee.repository.ts
export class EmployeeRepository {
  static baseQuery = buildSafePrismaSelect(Employee); // ✅
}

// product.repository.prisma.ts
export class ProductRepository {
  static baseQuery = buildSafePrismaSelect(Product); // ✅
}

// user.repository.ts
export class UserRepository {
  static baseQuery = buildSafePrismaSelect(User); // ✅
}

// ... and 8+ more repositories
```

**Why this matters:**
- ✅ **Consistency** - New developers know the pattern
- ✅ **Predictability** - All repositories work the same way
- ✅ **Maintainability** - One pattern to understand and maintain
- ✅ **Refactoring** - Easy to update all repositories at once

---

## Real-World Impact

### Example: High-Traffic API

```typescript
// Endpoint: GET /api/users/:id
// Traffic: 10,000 requests/second

export class UserRepository {
  static baseQuery = buildSafePrismaSelect(User);
  
  async getById(id: string) {
    // baseQuery accessed 10,000 times/second
    // buildSafePrismaSelect called: 0 times/second ✅
    const raw = await this.client.user.findUnique({
      where: { id },
      ...UserRepository.baseQuery,
    });
    return this.buildAndTrackEntity(raw);
  }
}
```

**vs**

```typescript
export class UserRepository {
  async getById(id: string) {
    const select = this.getBaseSelect();
    // buildSafePrismaSelect called: 10,000 times/second ❌
    // (unless you implement caching, adding complexity)
    const raw = await this.client.user.findUnique({
      where: { id },
      ...select,
    });
    return this.buildAndTrackEntity(raw);
  }
}
```

### Impact:
- **Static**: 0ms overhead per request
- **Instance (no cache)**: ~5ms overhead per request = 50 seconds/second of wasted CPU
- **Instance (with cache)**: ~0.1ms overhead per request = 1 second/second of wasted CPU

---

## Hybrid Approach (Best of Both Worlds)

You can support both patterns:

```typescript
export class UserRepository extends PrismaRepository<User> {
  // ✅ Static for common case
  static baseQuery = buildSafePrismaSelect(User);
  
  constructor(prisma: PrismaClient) {
    super(prisma, User);
  }
  
  // ✅ Instance method for custom queries
  async getByIdWithPosts(id: string) {
    const baseSelect = this.getBaseSelect();
    
    const raw = await this.client.user.findUnique({
      where: { id },
      select: {
        ...baseSelect?.select,
        posts: { select: { id: true, title: true } }, // Extend base
      },
    });
    return this.buildAndTrackEntity(raw);
  }
  
  // ✅ Standard queries use static
  async getById(id: string) {
    const raw = await this.client.user.findUnique({
      where: { id },
      ...UserRepository.baseQuery, // Fast path
    });
    return this.buildAndTrackEntity(raw);
  }
}
```

---

## Summary

### Static Property Pattern

**Pros:**
- ✅ **Performance**: Computed once at module load
- ✅ **Memory**: Shared across all instances
- ✅ **Simplicity**: Less code, clearer intent
- ✅ **Consistency**: Matches your existing codebase
- ✅ **Immutability**: Can't be accidentally modified
- ✅ **Testing**: Easy to mock and verify

**Cons:**
- ❌ Can't vary per instance (rarely needed)
- ❌ Computed at module load (usually fine)

### Instance Method Pattern

**Pros:**
- ✅ Can vary per instance
- ✅ Lazy initialization possible
- ✅ Runtime configuration

**Cons:**
- ❌ Performance overhead (unless cached)
- ❌ More code/boilerplate
- ❌ Potential memory churn
- ❌ Inconsistent with your codebase

---

## Recommendation

**Use static properties for your base queries** because:

1. Your entities don't change structure per repository instance
2. Your existing codebase uses this pattern consistently
3. Performance and memory benefits are real
4. Code is simpler and more maintainable
5. You can still use instance methods when you need dynamic behavior

```typescript
// ✅ This is the way (your codebase pattern)
export class UserRepository extends PrismaRepository<User> {
  static baseQuery = buildSafePrismaSelect(User);
  
  async getById(id: string) {
    const raw = await this.client.user.findUnique({
      where: { id },
      ...UserRepository.baseQuery,
    });
    return this.buildAndTrackEntity(raw);
  }
  
  protected buildAndTrackEntity(raw: any): User | null {
    if (!raw) return null;
    const entity = fromPersistence(User, raw);
    this.tracker.track(entity.id, raw);
    return entity;
  }
}
```

**Reserve instance methods for truly dynamic scenarios** where the query needs to change based on runtime configuration or instance state.
