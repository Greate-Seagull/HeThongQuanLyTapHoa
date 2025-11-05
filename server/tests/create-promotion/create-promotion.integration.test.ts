import request from "supertest";
import app from "../../src/app";

describe("Create promotion integration test", () => {
	let path;
	let input;
	let output;

	// beforeAll(async () => {
	// 	await prisma.product.create({
	// 		data: product as any,
	// 	});
	// });

	// afterAll(async () => {
	// 	await prisma.product.delete({ where: { id: product.id } });
	// });

	describe("Normal case", () => {
		beforeAll(async () => {
			path = `/promotions`;
			input = {};
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});
	});

	// describe("Abnormal case", () => {
	// 	let fakeId = -1;

	// 	beforeAll(async () => {
	// 		path = `/products/${fakeId}`;
	// 		input = {};
	// 		output = await request(app).get(path).send(input);
	// 	});

	// 	it("Should return error message", () => {
	// 		expect(output.body.message).toBe(`Product not found. ${fakeId}`);
	// 	});
	// });
});
