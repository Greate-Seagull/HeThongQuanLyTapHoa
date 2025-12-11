import { record } from "../../types/database-record.type";
import { AnyEntity } from "../../types/entity.type";
import { Entity } from "../abstracts/entity";

export function toPersistenceUsingSchema<T extends AnyEntity>(
	entity: T | null,
	withRelations: boolean = false
): record {
	if (!entity) return null;
	const props = entity.props;
	if (!props) return null;

	let result: record = {};
	for (const key of Object.keys(props)) {
		if (key === "id") continue; // ID is not persisted directly

		const value = props[key];
		const converted = dispatch(value, withRelations);

		if (converted !== undefined) {
			result[key] = converted;
		}
	}

	return result;

	function dispatch(value: any, withRelations: boolean) {
		if (value == undefined || value == null) return null;
		if (!isContainer(value)) return toPersistenceNonContainer(value);

		if (!withRelations) return null;
		return toPersistenceContainer(value);
	}

	function isContainer(value: any) {
		return Array.isArray(value);
	}

	function toPersistenceNonContainer(value: any) {
		return value;
	}

	function toPersistenceContainer(values: Entity<any, any>[]) {
		if (!values.length) return null;
		return {
			connectOrCreate: values.map((entity: Entity<any, any>) => ({
				where: {
					id: entity.id,
				},
				create: toPersistenceUsingSchema(entity),
			})),
		};
	}
}

export function toPersistence(entity: any) {
	if (Array.isArray(entity)) {
		return entity.map(toPersistence);
	}

	const instance = entity.constructor.prototype;
	const writable = instance.__writable;
	if (!writable || writable.length === 0) return entity;

	let persist = {};
	for (const key of writable) {
		persist[key] = toPersistence(entity[key]);
	}
	return persist;
}

export function toPersistenceObject(entity: any) {
	const instance = entity.constructor.prototype;
	const writable = instance.__writable;
	if (!writable || writable.length === 0) return entity;

	let persist = {};
	for (const key of writable) {
		persist[key] = entity[key];
	}
	return persist;
}

export function fromPersistence(cls: any, raw: any) {
	if (Array.isArray(raw)) {
		return raw.map((r) => fromPersistence(cls, r));
	}

	const instance = cls.prototype;
	if (!instance) return raw;
	const types = instance.__typeMap;
	if (!types) return raw;

	let e = new cls();
	for (const key of Object.keys(e)) {
		const publicKey = key.startsWith("_") ? key.slice(1) : key;
		e[key] = fromPersistence(types[publicKey], raw[publicKey]);
	}
	return e;
}
