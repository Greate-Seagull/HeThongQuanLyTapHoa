export const product1 = {
	id: 10002,
	price: 100000,
	barcode: 123456,
};

export const product2 = {
	id: 10003,
	price: 100000,
	barcode: 123457,
};

let startedAt = new Date();
let endedAt = new Date();
endedAt.setDate(startedAt.getDate() + 14);

export const promotionInput = {
	name: "Create promotion",
	startedAt: startedAt.toISOString(),
	endedAt: endedAt.toISOString(),
	condition: "Create promotion",
	value: 0.5,
	promotionType: "PERCENTAGE",
	productIds: [product1.id, product2.id],
};
