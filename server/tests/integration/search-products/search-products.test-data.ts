import { ProductUnit } from "../../../src/generated/client";

export const product = {
	id: 99999,
	name: "Test Product",
	price: 10000,
	amount: 100,
	barcode: 9999999999,
	status: "GOOD",
	unit: ProductUnit.PIECE, // Use PIECE instead of UNKNOWN
	expiryDate: null,
	supplierId: null,
	categoryId: null,
};

const current = new Date();
const startedAt = new Date();
startedAt.setDate(current.getDate() - 14);
const endedAt = new Date();
endedAt.setDate(current.getDate() + 14);

export const promotion1 = {
	id: 88881,
	name: "Test Promotion 1",
	description: "Test",
	startedAt: new Date("2024-01-01"),
	endedAt: new Date("2024-12-31"),
	value: 10,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: [{ productId: product.id }],
	},
};

export const promotion2 = {
	id: 88882,
	name: "Test Promotion 2",
	description: "Test",
	startedAt: new Date("2024-01-01"),
	endedAt: new Date("2024-12-31"),
	value: 20,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: [{ productId: product.id }],
	},
};
