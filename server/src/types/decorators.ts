import { Constructor } from "./entity.type";

// decorators.ts
export function Read(target: any, propertyKey: string) {
	if (!Object.prototype.hasOwnProperty.call(target, "__readable")) {
		target.__readable = target.__readable ? [...target.__readable] : [];
	}
	target.__readable.push(propertyKey);
}

export function Write(target: any, propertyKey: string) {
	if (!Object.prototype.hasOwnProperty.call(target, "__writable")) {
		target.__writable = target.__writable ? [...target.__writable] : [];
	}
	target.__writable.push(propertyKey);
}

export function Relation<T>(type: Constructor<T>) {
	return (target: any, key: string) => {
		if (!Object.prototype.hasOwnProperty.call(target, "__relations")) {
			target.__relations = target.__relations
				? { ...target.__relations }
				: {};
		}
		target.__relations[key] = type;
	};
}

export function Required(target: any, propertyKey: string) {
	if (!Object.prototype.hasOwnProperty.call(target, "__required")) {
		target.__required = target.__required ? [...target.__required] : [];
	}
	target.__required.push(propertyKey);
}

export function Optional(target: any, propertyKey: string) {
	if (!Object.prototype.hasOwnProperty.call(target, "__optional")) {
		target.__optional = target.__optional ? [...target.__optional] : [];
	}
	target.__optional.push(propertyKey);
}
