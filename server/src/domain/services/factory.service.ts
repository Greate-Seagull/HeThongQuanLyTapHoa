export function create(cls: any, input: any) {
	if (Array.isArray(input)) {
		return input.map((i) => create(cls, i));
	}
	const instance = cls.prototype;
	if (!instance) return input;
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

	const optional = instance.__optional;
	if (!optional) return domain;
	for (const setter of optional) {
		const value = input[setter];
		if (value === undefined || value === null) continue;

		domain[setter] = create(types[setter], value);
	}
	return domain;
}
