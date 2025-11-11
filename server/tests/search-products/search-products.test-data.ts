export const product = {
	id: 10001,
	name: "search product",
	price: 100000,
	barcode: 12345,
};

let current = new Date();
let startedAt = new Date();
startedAt.setDate(current.getDate() - 14);
let endedAt = new Date();
endedAt.setDate(current.getDate() + 14);

export const promotion1 = {
	id: 10001,
	name: "search product 1",
	startedAt: startedAt.toISOString(),
	endedAt: endedAt.toISOString(),
	value: 0.2,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: {
			productId: product.id,
		},
	},
};

export const promotion2 = {
	id: 10002,
	name: "search product 2",
	startedAt: startedAt.toISOString(),
	endedAt: endedAt.toISOString(),
	value: 30000,
	promotionType: "FIXED",
	promotionDetails: {
		create: {
			productId: product.id,
		},
	},
};
