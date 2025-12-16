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

export function Type(type: any) {
	return (target: any, key: string) => {
		if (!Object.prototype.hasOwnProperty.call(target, "__typeMap")) {
			target.__typeMap = target.__typeMap ? { ...target.__typeMap } : {};
		}
		target.__typeMap[key] = type;
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
export function Relation(relationType: any) {
	return (target: any, key: string) => {
		if (!Object.prototype.hasOwnProperty.call(target, "__relationMap")) {
			target.__relationMap = target.__relationMap
				? { ...target.__relationMap }
				: {};
		}
		target.__relationMap[key] = relationType;
	};
}
