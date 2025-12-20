export const product = {
	id: 20001,
	name: "search product",
	price: 100000,
	barcode: 12345,
};

const current = new Date();
const startedAt = new Date();
startedAt.setDate(current.getDate() - 14);
const endedAt = new Date();
endedAt.setDate(current.getDate() + 14);

export const promotion1 = {
	id: 20001,
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
	id: 20002,
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
