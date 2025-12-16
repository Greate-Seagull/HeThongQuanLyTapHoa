// decorators.ts
export function Read(target: any, propertyKey: string) {
	if (!target.__readable) target.__readable = [];
	target.__readable.push(propertyKey);
}

export function Write(target: any, propertyKey: string) {
	if (!target.__writable) target.__writable = [];
	target.__writable.push(propertyKey);
}

export function Type(type: any) {
	return (target: any, key: string) => {
		if (!target.__typeMap) target.__typeMap = {};
		target.__typeMap[key] = type;
	};
}

export function Required(target: any, propertyKey: string) {
	if (!target.__required) target.__required = [];
	target.__required.push(propertyKey);
}

export function Optional(target: any, propertyKey: string) {
	if (!target.__optional) target.__optional = [];
	target.__optional.push(propertyKey);
}
