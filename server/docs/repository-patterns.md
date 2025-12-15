# Safer Implementation Patterns for `getBaseSelect`

## Summary of Changes

The `base.repository.ts` has been refactored to use safer, more maintainable patterns that align with your existing codebase conventions.

## What Changed

### Before (Unsafe)
```typescript
export class PrismaRepository<EntityType extends BaseEntity<Id>> {
  private readonly tracker = new ChangeTracker<any>();
  
  constructor(
    private readonly client: PrismaClient,
    private readonly entityClass: new () => EntityType
  ) {}
  
  private getBaseSelect(cls: new () => EntityType): { select: object } {
    const instance = cls.prototype;
    if (!instance) return null;
    const readable = instance.__readable;
    if (!readable || readable.length === 0) return null;
    
    const types = instance.__typeMap;
    if (!types) return null;
    
    const select = {};
    for (const key of readable) {
      const subSelect = this.buildSafePrismaSelect(types[key]); // ❌ Method doesn't exist
      select[key] = subSelect || true;
    }
    return { select };
  }
}
```

### After (Safe)
```typescript
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
  protected readonly tracker = new ChangeTracker<any>();
  
  constructor(
    protected readonly client: PrismaClient,
    protected readonly entityClass: new () => EntityType
  ) {}
  
  protected getBaseSelect(): { select: object } | null {
    return buildSafePrismaSelect(this.entityClass); // ✅ Uses proven utility
  }
  
  protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

## Key Improvements

### 1. **Eliminated Code Duplication**
- Removed duplicate logic that already exists in `query-builder.service.ts`
- Uses the battle-tested `buildSafePrismaSelect()` utility function
- Single source of truth for query building logic

### 2. **Better Type Safety**
- Changed from `class` to `abstract class` - prevents direct instantiation
- Changed visibility from `private` to `protected` - allows subclass access
- Made `buildAndTrackEntity` abstract - forces implementation in subclasses
- Proper return type: `{ select: object } | null`

### 3. **Follows Existing Patterns**
Your codebase already uses the static property pattern in all repositories:

```typescript
// account.repository.ts
export class AccountRepository {
  static baseQuery = buildSafePrismaSelect(Account);
  
  async getByPhoneNumber(phoneNumber: string) {
    const raw = await this.prisma.account.findUnique({
      where: { phoneNumber },
      ...AccountRepository.baseQuery, // ✅ Static property
    });
    // ...
  }
}
```

### 4. **Comprehensive Documentation**
Added JSDoc comments explaining:
- How to use the base class
- The recommended pattern with examples
- What each method does

## Recommended Usage Pattern

### Pattern 1: Static Property (Best - Matches Your Codebase)

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaRepository } from "./base.repository";
import { User } from "../../domain/user";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { fromPersistence } from "../../domain/services/mapper.service";

export class UserRepository extends PrismaRepository<User> {
  // ✅ Define once, use everywhere
  static baseQuery = buildSafePrismaSelect(User);
  
  constructor(prisma: PrismaClient) {
    super(prisma, User);
  }
  
  async getById(id: string) {
    const raw = await this.client.user.findUnique({
      where: { id },
      ...UserRepository.baseQuery, // ✅ Type-safe, computed at module load
    });
    
    return this.buildAndTrackEntity(raw);
  }
  
  async getAll() {
    const rawList = await this.client.user.findMany({
      ...UserRepository.baseQuery, // ✅ Reuse the same query
    });
    
    return rawList.map(raw => this.buildAndTrackEntity(raw));
  }
  
  protected buildAndTrackEntity(raw: any): User | null {
    if (!raw) return null;
    
    const entity = fromPersistence(User, raw);
    this.tracker.track(entity.id, raw);
    return entity;
  }
}
```

**Benefits:**
- ✅ Query built once at module load time (performance)
- ✅ Type-safe and consistent across all methods
- ✅ Matches your existing repository pattern
- ✅ Easy to test and mock
- ✅ No runtime prototype manipulation

### Pattern 2: Protected Method (Alternative)

If you need dynamic query building:

```typescript
export class UserRepository extends PrismaRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, User);
  }
  
  async getById(id: string, includeRelations = false) {
    const baseSelect = this.getBaseSelect(); // ✅ Use protected method
    
    const raw = await this.client.user.findUnique({
      where: { id },
      ...baseSelect,
      // Optionally extend the select
      ...(includeRelations && {
        select: {
          ...baseSelect.select,
          posts: { select: { id: true, title: true } }
        }
      })
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

**Benefits:**
- ✅ Flexibility for dynamic queries
- ✅ Can extend base select per query
- ✅ Still uses proven utility function

## Why This Is Safer

### Problem 1: Missing Method Reference
**Before:**
```typescript
const subSelect = this.buildSafePrismaSelect(types[key]); // ❌ Method doesn't exist
```

**After:**
```typescript
return buildSafePrismaSelect(this.entityClass); // ✅ Uses existing utility
```

### Problem 2: Unsafe Type Assertions
**Before:**
```typescript
const instance = cls.prototype; // any
const readable = instance.__readable; // any
const types = instance.__typeMap; // any
```

**After:**
```typescript
// Delegated to buildSafePrismaSelect which handles this safely
```

### Problem 3: Code Duplication
**Before:**
- Logic duplicated in `base.repository.ts` and `query-builder.service.ts`
- Two places to maintain and test
- Risk of divergence

**After:**
- Single source of truth in `query-builder.service.ts`
- Reused across all repositories
- Easier to maintain and test

### Problem 4: Visibility Issues
**Before:**
```typescript
private readonly client: PrismaClient; // ❌ Subclasses can't access
private readonly tracker: ChangeTracker; // ❌ Subclasses can't access
```

**After:**
```typescript
protected readonly client: PrismaClient; // ✅ Subclasses can access
protected readonly tracker: ChangeTracker; // ✅ Subclasses can access
```

## Additional Safety Improvements to Consider

### 1. Add Runtime Validation

```typescript
protected getBaseSelect(): { select: object } | null {
  const result = buildSafePrismaSelect(this.entityClass);
  
  if (!result) {
    console.warn(
      `No @Read decorators found on ${this.entityClass.name}. ` +
      `Ensure your entity has proper decorator metadata.`
    );
  }
  
  return result;
}
```

### 2. Add Type Guards

```typescript
import { Prisma } from "@prisma/client";

protected getBaseSelect(): Prisma.UserSelect | null {
  return buildSafePrismaSelect(this.entityClass);
}
```

### 3. Cache the Result

```typescript
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
  private _cachedSelect: { select: object } | null = null;
  
  protected getBaseSelect(): { select: object } | null {
    if (!this._cachedSelect) {
      this._cachedSelect = buildSafePrismaSelect(this.entityClass);
    }
    return this._cachedSelect;
  }
}
```

## Migration Guide

If you have existing repositories using the old pattern:

### Before
```typescript
async getById(id: Id) {
  const raw = await this.client.findUnique({
    where: { id },
    select: this.getBaseSelect(this.entityClass),
  });
  return this.buildAndTrackEntity(raw);
}
```

### After (Recommended)
```typescript
export class MyRepository extends PrismaRepository<MyEntity> {
  static baseQuery = buildSafePrismaSelect(MyEntity);
  
  async getById(id: string) {
    const raw = await this.client.myEntity.findUnique({
      where: { id },
      ...MyRepository.baseQuery,
    });
    return this.buildAndTrackEntity(raw);
  }
  
  protected buildAndTrackEntity(raw: any): MyEntity | null {
    if (!raw) return null;
    const entity = fromPersistence(MyEntity, raw);
    this.tracker.track(entity.id, raw);
    return entity;
  }
}
```

## Testing

The new pattern is easier to test:

```typescript
describe('UserRepository', () => {
  it('should have valid base query', () => {
    expect(UserRepository.baseQuery).toBeDefined();
    expect(UserRepository.baseQuery.select).toBeDefined();
    expect(UserRepository.baseQuery.select).toHaveProperty('id');
  });
  
  it('should build queries correctly', async () => {
    const mockPrisma = createMockPrismaClient();
    const repo = new UserRepository(mockPrisma);
    
    await repo.getById('123');
    
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
      ...UserRepository.baseQuery,
    });
  });
});
```

## Conclusion

The refactored implementation:
- ✅ Eliminates code duplication
- ✅ Uses proven utility functions
- ✅ Follows existing codebase patterns
- ✅ Provides better type safety
- ✅ Is easier to test and maintain
- ✅ Has comprehensive documentation
- ✅ Prevents direct instantiation (abstract class)
- ✅ Forces implementation of required methods

This aligns with your existing repository implementations and provides a solid foundation for future development.
