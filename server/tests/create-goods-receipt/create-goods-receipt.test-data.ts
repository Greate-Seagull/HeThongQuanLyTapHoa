export const employee = {
	id: 10000,
	name: "create good receipt",
};

export const product1 = {
	id: 10000,
	name: "create good receipt",
	price: 100000,
};

export const send = {
	employeeId: 10000,
	items: [
		{
			productId: product1.id,
			quantity: 50,
			price: 80000,
		},
	],
};
