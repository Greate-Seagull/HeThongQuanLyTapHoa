import { Dto } from "../../application/DTOs/base.dto";
import { Constructor } from "../../types/entity.type";
import { BaseEntity, Id } from "../abstracts/entity";

export function toPersistence(entity: any) {
	if (Array.isArray(entity)) {
		return entity.map(toPersistence);
	}

	const instance = entity.constructor.prototype;
	const writable = instance.__writable;
	if (!writable || writable.length === 0) return entity;

	const persist = {};
	for (const key of writable) {
		persist[key] = toPersistence(entity[key]);
	}
	return persist;
}

export function toPersistenceObject(entity: any) {
	if (!entity) return null;

	const instance = entity.constructor.prototype;
	const writable = instance.__writable;
	if (!writable || writable.length === 0) return entity;

	const persist = {};
	for (const key of writable) {
		persist[key] = entity[key];
	}
	return persist;
}

export function fromPersistence<T extends BaseEntity<Id>>(
	cls: Constructor<T>,
	raw: Dto<T> | null
): T | null {
	if (!cls || !raw) return null;

	const instance = cls.prototype;
	if (!instance) return null;
	const relations = instance.__relations || {};

	const e = new cls();
	
	const readable = instance.__readable || [];
	
	// Map từ Object.keys như cũ
	for (const key of Object.keys(e)) {
		const publicKey = key.startsWith("_") ? key.slice(1) : key;
		const value = raw[publicKey];
		if (Array.isArray(value))
			e[key] = value.map((v) => fromPersistence(relations[publicKey], v));
		else e[key] = fromPersistence(relations[publicKey], value) || value;
	}
	
	// ✅ Fallback để map fields có @Read nhưng không có trong Object.keys
	for (const publicKey of readable) {
		const privateKey = `_${publicKey}`;
		// Chỉ map nếu chưa được map ở trên
		if (e[privateKey] === undefined && raw[publicKey] !== undefined) {
			const value = raw[publicKey];
			if (Array.isArray(value))
				e[privateKey] = value.map((v) => fromPersistence(relations[publicKey], v));
			else 
				e[privateKey] = fromPersistence(relations[publicKey], value) || value;
		}
	}
	
	return e;
}

export function toSnapshot(entity: BaseEntity<Id>): object | null {
	if (!entity) return null;

	const instance = entity.constructor.prototype;
	const writable = instance.__writable;
	if (!writable || writable.length === 0) return entity;

	const snapshot = {};
	for (const key of writable) {
		const value = entity[key];
		if (Array.isArray(value))
			snapshot[key] = value.map((v) => toSnapshot(v));
		else snapshot[key] = toSnapshot(value) || value;
	}
	return snapshot;
}
