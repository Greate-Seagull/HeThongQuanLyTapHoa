import { ProductUnit } from "../../../src/generated/client";

export const product = {
	name: "Test Product",
	price: 10000,
	amount: 100,
	barcode: 999999999, // ✅ Changed from 9999999999 - fits INT4 (max 2,147,483,647)
	status: "GOOD",
	unit: ProductUnit.PIECE,
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
		// Will be created after product is inserted
		create: [] as any[]
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
		// Will be created after product is inserted
		create: [] as any[]
	},
};
