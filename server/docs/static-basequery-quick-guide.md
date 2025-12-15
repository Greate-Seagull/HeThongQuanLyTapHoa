# Quick Answer: Static BaseQuery Pattern

## ❌ What You Tried (Won't Work)

```typescript
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
    // ❌ ERROR: Can't access 'this' in static context
    // ❌ ERROR: Can't access instance property 'entityClass'
    // ❌ ERROR: Can't use generic type 'EntityType' in static context
    private static baseQuery = buildSafePrismaSelect(new this.entityClass());
}
```

**Why it fails:**
- Static members belong to the **class**, not instances
- `this.entityClass` is an **instance property**
- Static context has **no access** to instance properties or `this`
- Generic types only exist on **instances**, not the class itself

---

## ✅ Correct Pattern (What Your Codebase Uses)

### Step 1: Keep Base Class Simple

```typescript
// base.repository.ts
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	protected readonly tracker = new ChangeTracker<any>();

	constructor(
		protected readonly client: PrismaClient,
		protected readonly entityClass: new () => EntityType
	) {}

	protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

### Step 2: Define Static in Each Subclass

```typescript
// user.repository.ts
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class UserRepository extends PrismaRepository<User> {
	// ✅ Define static baseQuery HERE, in the concrete class
	static baseQuery = buildSafePrismaSelect(User);

	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}

	async getById(id: string) {
		const raw = await this.client.user.findUnique({
			where: { id },
			...UserRepository.baseQuery, // ✅ Use it like this
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

---

## Why This Pattern Works

```
┌─────────────────────────────────────────────────────────────┐
│ Base Class (Generic)                                         │
│                                                               │
│ export abstract class PrismaRepository<EntityType> {         │
│   // No static baseQuery here                                │
│   // Generic types don't exist at class level                │
│ }                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ extends
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Concrete Class (Knows the Type)                              │
│                                                               │
│ export class UserRepository extends PrismaRepository<User> { │
│   // ✅ NOW we know the concrete type is 'User'              │
│   static baseQuery = buildSafePrismaSelect(User);            │
│ }                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## This is Exactly What Your Codebase Does

All your existing repositories follow this pattern:

```typescript
// account.repository.ts
export class AccountRepository extends PrismaRepository<Account> {
	static baseQuery = buildSafePrismaSelect(Account); // ✅
}

// employee.repository.ts
export class EmployeeRepository extends PrismaRepository<Employee> {
	static baseQuery = buildSafePrismaSelect(Employee); // ✅
}

// product.repository.ts
export class ProductRepository extends PrismaRepository<Product> {
	static baseQuery = buildSafePrismaSelect(Product); // ✅
}

// user.repository.ts
export class UserRepository extends PrismaRepository<User> {
	static baseQuery = buildSafePrismaSelect(User); // ✅
}
```

**This is the correct pattern. Don't try to put it in the base class!**

---

## Alternative: Static Helper Method

If you want a helper in the base class:

```typescript
// base.repository.ts
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	// ✅ Static method with explicit type parameter
	static buildBaseQuery<T extends BaseEntity<Id>>(
		entityClass: new () => T
	): { select: object } | null {
		return buildSafePrismaSelect(entityClass);
	}
}
```

```typescript
// user.repository.ts
export class UserRepository extends PrismaRepository<User> {
	// ✅ Use the helper method
	static baseQuery = PrismaRepository.buildBaseQuery(User);
}
```

But this is just extra indirection - calling `buildSafePrismaSelect(User)` directly is simpler!

---

## Summary

**Don't try to create a static property in the base class that uses generic types.**

Instead:
1. ✅ Keep the base class generic and simple
2. ✅ Define `static baseQuery` in each concrete repository
3. ✅ This is what your entire codebase already does
4. ✅ It's the correct TypeScript pattern

**Your repositories should look like this:**

```typescript
export class MyRepository extends PrismaRepository<MyEntity> {
	static baseQuery = buildSafePrismaSelect(MyEntity);
	
	constructor(prisma: PrismaClient) {
		super(prisma, MyEntity);
	}
	
	// ... your methods using MyRepository.baseQuery
}
```

That's it! Simple and effective. 🎯
