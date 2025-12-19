import { ProductUnit } from "../../../src/generated/client";

export const product = {
	name: "Test Product",
	price: 10000,
	amount: 100,
	barcode: 999999999,
	status: "GOOD",
	unit: ProductUnit.PIECE,
	expiryDate: null,
	supplierId: null,
	categoryId: null,
};

// Sử dụng ngày linh hoạt thay vì fix cứng 2024
const now = new Date();
const nextYear = new Date();
nextYear.setFullYear(now.getFullYear() + 1);

export const promotion1 = {
	id: 88881,
	name: "Test Promotion 1",
	description: "Test",
	startedAt: new Date("2024-01-01"), // Giữ cũ hoặc đổi thành now
	endedAt: nextYear,               // Đảm bảo còn hạn
	value: 10,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: [] as any[]
	},
};

export const promotion2 = {
	id: 88882,
	name: "Test Promotion 2",
	description: "Test",
	startedAt: new Date("2024-01-01"),
	endedAt: nextYear,               // Đảm bảo còn hạn
	value: 20,
	promotionType: "PERCENTAGE",
	promotionDetails: {
		create: [] as any[]
	},
};