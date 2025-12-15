# Static BaseQuery Patterns - Complete Guide

## The Problem You Encountered

You tried to create a static `baseQuery` in the base class:

```typescript
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
    private static baseQuery = buildSafePrismaSelect(new this.entityClass()); // ❌ Won't work!
}
```

**Why this fails:**
1. ❌ `this.entityClass` doesn't exist in static context
2. ❌ Static members can't access instance properties
3. ❌ Static members can't use generic type parameters
4. ❌ You can't instantiate `EntityType` in the base class

---

## ✅ Solution 1: Static Property in Each Subclass (RECOMMENDED)

This is the **standard pattern** used throughout your codebase.

### Implementation

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

```typescript
// user.repository.ts
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { User } from "../../domain/user";

export class UserRepository extends PrismaRepository<User> {
	// ✅ Define static baseQuery in the subclass
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

	protected buildAndTrackEntity(raw: any): User | null {
		if (!raw) return null;
		const entity = fromPersistence(User, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}
}
```

**Pros:**
- ✅ Simple and straightforward
- ✅ Matches your existing codebase (12+ repositories)
- ✅ Type-safe
- ✅ Best performance
- ✅ Clear and explicit

**Cons:**
- ⚠️ Must define in each repository (but this is actually good - explicit is better)

---

## ✅ Solution 2: Static Method with Type Parameter

If you want a helper in the base class, use a **static method** instead:

### Implementation

```typescript
// base.repository.ts
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	protected readonly tracker = new ChangeTracker<any>();

	constructor(
		protected readonly client: PrismaClient,
		protected readonly entityClass: new () => EntityType
	) {}

	/**
	 * Static helper to build base query for any entity type.
	 * Use this in subclass static initializers.
	 */
	static buildBaseQuery<T extends BaseEntity<Id>>(
		entityClass: new () => T
	): { select: object } | null {
		return buildSafePrismaSelect(entityClass);
	}

	protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

```typescript
// user.repository.ts
export class UserRepository extends PrismaRepository<User> {
	// ✅ Use the static helper method
	static baseQuery = PrismaRepository.buildBaseQuery(User);

	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}

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

**Pros:**
- ✅ Provides a helper method in the base class
- ✅ Can add validation/logging in one place
- ✅ Still type-safe

**Cons:**
- ⚠️ More verbose than just calling `buildSafePrismaSelect` directly
- ⚠️ Adds an extra layer of indirection

---

## ✅ Solution 3: Lazy Instance Property with Caching

If you want the base class to handle it automatically:

### Implementation

```typescript
// base.repository.ts
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	protected readonly tracker = new ChangeTracker<any>();
	private _baseQuery: { select: object } | null = null;

	constructor(
		protected readonly client: PrismaClient,
		protected readonly entityClass: new () => EntityType
	) {}

	/**
	 * Gets the base query, building and caching it on first access.
	 */
	protected get baseQuery(): { select: object } | null {
		if (!this._baseQuery) {
			this._baseQuery = buildSafePrismaSelect(this.entityClass);
		}
		return this._baseQuery;
	}

	protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

```typescript
// user.repository.ts
export class UserRepository extends PrismaRepository<User> {
	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}

	async getById(id: string) {
		const raw = await this.client.user.findUnique({
			where: { id },
			...this.baseQuery, // ✅ Access via instance property
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

**Pros:**
- ✅ No need to define in each subclass
- ✅ Automatic caching per instance
- ✅ Lazy initialization

**Cons:**
- ❌ Not truly static (each instance has its own cached copy)
- ❌ Slight performance overhead on first access
- ❌ More memory usage (one cache per instance)
- ❌ Doesn't match your existing pattern

---

## ✅ Solution 4: Abstract Static Property (TypeScript 4.9+)

TypeScript doesn't support abstract static members directly, but you can enforce it with a pattern:

### Implementation

```typescript
// base.repository.ts
export interface RepositoryStatics<T extends BaseEntity<Id>> {
	baseQuery: { select: object } | null;
	new (prisma: PrismaClient): PrismaRepository<T>;
}

export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	protected readonly tracker = new ChangeTracker<any>();

	constructor(
		protected readonly client: PrismaClient,
		protected readonly entityClass: new () => EntityType
	) {}

	protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

```typescript
// user.repository.ts
export class UserRepository extends PrismaRepository<User> {
	// ✅ TypeScript will enforce this exists
	static baseQuery = buildSafePrismaSelect(User);

	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}

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

// Type assertion to enforce the static property
const _: RepositoryStatics<User> = UserRepository;
```

**Pros:**
- ✅ Enforces static property via type system
- ✅ Compile-time checking

**Cons:**
- ⚠️ Requires type assertion in each repository
- ⚠️ More complex
- ⚠️ Overkill for most cases

---

## Comparison Table

| Pattern | Performance | Memory | Simplicity | Type Safety | Matches Codebase |
|---------|-------------|--------|------------|-------------|------------------|
| **Static in Subclass** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes |
| **Static Helper Method** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Similar |
| **Lazy Instance Property** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ No |
| **Abstract Static Interface** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ No |

---

## My Recommendation

**Use Solution 1: Static Property in Each Subclass**

```typescript
export class UserRepository extends PrismaRepository<User> {
	static baseQuery = buildSafePrismaSelect(User);
	
	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}
}
```

**Why:**
1. ✅ **Matches your existing codebase** - All 12+ repositories use this
2. ✅ **Best performance** - Query built once at module load
3. ✅ **Simplest code** - Easy to read and understand
4. ✅ **Type-safe** - Full TypeScript support
5. ✅ **Explicit** - Clear what query each repository uses
6. ✅ **No magic** - No hidden caching or lazy initialization

---

## Why You Can't Put Static in Base Class

This is a **fundamental TypeScript limitation**:

```typescript
// ❌ This is IMPOSSIBLE in TypeScript
export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	// Static members can't use generic type parameters
	static baseQuery = buildSafePrismaSelect(EntityType); // ❌ EntityType doesn't exist here
	
	// Static members can't access instance properties
	static baseQuery = buildSafePrismaSelect(this.entityClass); // ❌ 'this' doesn't exist here
}
```

**Why:**
- Static members belong to the **class**, not instances
- Generic type parameters belong to **instances**, not the class
- Static context has no access to `this` or instance properties
- Each subclass would need its own static property anyway

**The solution:** Define the static property in each subclass where you know the concrete type.

---

## Complete Working Example

Here's a complete example using the recommended pattern:

```typescript
// base.repository.ts
import { PrismaClient } from "@prisma/client";
import { ChangeTracker } from "../cache/change-tracker";
import { BaseEntity, Id } from "../../domain/abstracts/entity";

export abstract class PrismaRepository<EntityType extends BaseEntity<Id>> {
	protected readonly tracker = new ChangeTracker<any>();

	constructor(
		protected readonly client: PrismaClient,
		protected readonly entityClass: new () => EntityType
	) {}

	protected abstract buildAndTrackEntity(raw: any): EntityType | null;
}
```

```typescript
// user.repository.ts
import { PrismaClient } from "@prisma/client";
import { PrismaRepository } from "./base.repository";
import { User } from "../../domain/user";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { fromPersistence, toPersistenceObject } from "../../domain/services/mapper.service";

export class UserRepository extends PrismaRepository<User> {
	// ✅ Static property defined in subclass
	static baseQuery = buildSafePrismaSelect(User);

	constructor(prisma: PrismaClient) {
		super(prisma, User);
	}

	async getById(id: string): Promise<User | null> {
		const raw = await this.client.user.findUnique({
			where: { id },
			...UserRepository.baseQuery,
		});
		return this.buildAndTrackEntity(raw);
	}

	async getAll(): Promise<User[]> {
		const rawList = await this.client.user.findMany({
			...UserRepository.baseQuery,
		});
		return rawList
			.map(raw => this.buildAndTrackEntity(raw))
			.filter((user): user is User => user !== null);
	}

	async create(user: User): Promise<User> {
		const raw = await this.client.user.create({
			data: toPersistenceObject(user),
			...UserRepository.baseQuery,
		});
		return this.buildAndTrackEntity(raw)!;
	}

	protected buildAndTrackEntity(raw: any): User | null {
		if (!raw) return null;
		const entity = fromPersistence(User, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}
}
```

This is **exactly** how your existing repositories work, and it's the best pattern for your use case!
