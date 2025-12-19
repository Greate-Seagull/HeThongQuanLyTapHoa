export const product2 = {
	// Remove id - let Prisma auto-generate
	name: "update products",
	price: 100000,
	barcode: 234567,
	amount: 200,
	unit: "PIECE",
	status: "GOOD",
};

export const product1Input = {
	// No ID - will be inserted
	name: "update products 1",
	price: 100000,
	unit: "PIECE",
	barcode: 123456,
};

export const product2Input = {
	// ID will be set in test - will be updated
	name: "update products 2",
	price: 200000,
	unit: "PIECE",
	barcode: 234568,  // Different barcode to avoid conflict
};

export const send = { 
	authId: 1, 
	products: [product1Input, product2Input] 
};
