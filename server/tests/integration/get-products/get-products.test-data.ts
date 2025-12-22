import { ProductUnit, ProductStatus } from "../../../src/generated/client";

export const product2 = {
	id: 20003,
	name: "get products test 2",
	price: 100000,
	barcode: 234567,
	amount: 50,
	unit: ProductUnit.PIECE,  // ✅ Use enum value
	status: ProductStatus.GOOD,  // ✅ Use enum value
};

export const product1 = {
	id: 20002,
	name: "get products test 1",
	price: 100000,
	barcode: 123456,
	amount: 100,
	unit: ProductUnit.BOTTLE,  // ✅ Use enum value
	status: ProductStatus.GOOD,  // ✅ Use enum value
};
