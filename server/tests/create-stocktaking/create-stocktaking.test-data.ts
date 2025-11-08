export const employee = {
	id: 10000,
	name: "create invoice",
};

export const slot = {
	id: 11111,
	name: "create invoice !",
};

export const rack = {
	id: 10000,
	name: "create invoice A",
	slots: {
		create: slot,
	},
};

export const shelf = {
	id: 10000,
	name: "create invoice 1",
	racks: {
		create: rack,
	},
};

export const product1 = {
	id: 10000,
	name: "update products 1",
	price: 100000,
	barcode: 234567,
};

export const product2 = {
	id: 10001,
	name: "update products 2",
	price: 50000,
	barcode: 134567,
};

export const product1Input = {
	barcode: product1.barcode,
	slotId: slot.id,
	status: "EXPIRED",
	quantity: 10,
};

export const product2Input = {
	barcode: product2.barcode,
	slotId: slot.id,
	status: "GOOD",
	quantity: 15,
};

export const send = {
	employeeId: employee.id,
	products: [product1Input, product2Input],
};
