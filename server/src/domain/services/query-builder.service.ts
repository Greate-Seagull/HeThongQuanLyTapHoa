import { z } from "zod";
import { Constructor } from "zod/v4/core/util.cjs";

/**
 * Recursively build a Prisma `select` object from a Zod schema.
 * Includes all fields from the schema. Nested objects are handled recursively.
 */
export function buildPrismaSelectFromSchema(schema: any) {
	if (!(schema instanceof z.ZodObject)) return true; // primitives → select all

	const shape = schema.shape;
	const select = {};

	for (const key of Object.keys(shape)) {
		let field = shape[key];
		field = unwrap(field);

		if (field instanceof z.ZodObject) {
			select[key] = { select: buildPrismaSelectFromSchema(field) };
		} else if (field instanceof z.ZodArray) {
			select[key] = {
				select: buildPrismaSelectFromSchema(field.element),
			};
		} else {
			select[key] = true;
		}
	}

	return select;
}

export function unwrap(field) {
	const type = ["optional", "nullable", "default"];
	while (type.includes(field.type)) {
		field = field.unwrap();
	}
	return field;
}

export function buildPrismaSelectFromDecorator(cls: any) {
	const instance = cls.prototype;
	if (!instance) return null;
	const readable = instance.__readable;
	if (!readable || readable.length === 0) return true;

	const types = instance.__typeMap;
	if (!types) return true;

	const select = {};
	for (const key of readable) {
		select[key] = buildPrismaSelectFromDecorator(types[key]);
	}
	return { select };
}

export function buildSafePrismaSelect<T>(cls: Constructor<T>): {
	select: object;
} {
	if (!cls) return null;

	const instance = cls.prototype;
	const readable = instance.__readable;
	if (!readable || readable.length === 0) return null;

	const relations = instance.__relations || {};

	const select = {};
	for (const key of readable) {
		const subSelect = buildSafePrismaSelect(relations[key]);
		select[key] = subSelect || true;
	}

	return { select };
}
