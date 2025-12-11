import { prisma } from "../composition-root";
import { EmployeePosition } from "../domain/employee";
import { GoodReceipt, GoodReceiptDetail } from "../domain/good-receipt";
import { Product } from "../domain/product";
import { toPersistenceObject } from "../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../domain/services/query-builder.service";

function buildSelect(cls: any) {
	const instance = cls.prototype;
	const readable = instance.__readable;
	if (!readable || readable.length === 0) return true;

	const types = instance.__typeMap;
	if (!types) return true;

	let select = {};
	for (const key of readable) {
		select[key] = buildSelect(types[key]);
	}
	return { select };
}

function create(cls: any, input: any) {
	if (Array.isArray(input)) {
		return input.map((i) => create(cls, i));
	}
	const instance = cls.prototype;
	const required = instance.__required;
	if (!required || required.length === 0) return input;

	const types = instance.__typeMap;
	if (!types) return input;

	let domain = new cls();
	for (const setter of required) {
		const value = input[setter];
		if (value === undefined || value === null)
			throw Error(`Missing required field, ${setter}`);

		domain[setter] = create(types[setter], value);
	}
	return domain;
}

function toPersistence(entity: any) {
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

function fromPersistence(cls: any, raw: any) {
	if (Array.isArray(raw)) {
		return raw.map((r) => fromPersistence(cls, r));
	}

	const instance = cls.prototype;
	const types = instance.__typeMap;
	if (!types) return raw;

	let e = new cls();
	for (const key of Object.keys(e)) {
		const publicKey = key.startsWith("_") ? key.slice(1) : key;
		e[key] = fromPersistence(types[publicKey], raw[publicKey]);
	}
	return e;
}

async function checkDB() {
	let e = null;
	console.dir(await prisma.product.deleteMany(), {
		depth: null,
	});
}

checkDB();

// prisma.$on("query", (e) => {
// 	console.log("Query: " + e.query);
// 	console.log("Duration: " + e.duration + "ms");
// });
