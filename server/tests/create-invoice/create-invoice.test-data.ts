export const employee = {
	id: 10000,
	name: "create invoice",
	position: "SALES",
};

export const user = {
	id: 10000,
	name: "create invoice",
	point: 3000,
};

export const product1 = {
	id: 10000,
	name: "create invoice 1",
	price: 100000,
	barcode: 123456,
	amount: 10,
};

export const product2 = {
	id: 10001,
	name: "create invoice 2",
	price: 80000,
	barcode: 123457,
	amount: 8,
};

export const promotion1 = {
	id: 10000,
	name: "create invoice 1",
	startedAt: new Date(),
	endedAt: new Date(),
	value: 0.2,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: {
			productId: product1.id,
		},
	},
};

export const promotion2 = {
	id: 10001,
	name: "create invoice 2",
	startedAt: new Date(),
	endedAt: new Date(),
	value: 30000,
	promotionType: "FIXED",
	promotionDetails: {
		create: {
			productId: product1.id,
		},
	},
};

export const item1 = {
	productId: product1.id,
	quantity: product1.amount / 2,
	promotionId: promotion1.id,
};

export const item2 = {
	productId: product2.id,
	quantity: 1,
	promotionId: undefined,
};

export const send = {
	authId: employee.id,
	userId: user.id,
	items: [item1, item2],
};
