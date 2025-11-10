import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { account, send, user } from "./sign-up.test-data";

jest.setTimeout(20000);

describe("Sign up integration test", () => {
	let path = `/accounts`;
	let input;
	let output;

	beforeAll(async () => {});

	afterAll(async () => {});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await request(app).post(path).send(input);
		});

		afterAll(async () => {
			await prisma.account.delete({
				where: { phoneNumber: input.phoneNumber },
			});
			await prisma.user.deleteMany({
				where: { name: input.name },
			});
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return jwt", () => {
			expect(output.body).toHaveProperty("token");
		});
	});

	describe("Abnormal case", () => {
		describe("Existed phone number case", () => {
			beforeAll(async () => {
				await prisma.user.create({ data: user });
				await prisma.account.create({ data: account });

				input = structuredClone(send);
				input.phoneNumber = account.phoneNumber;
				output = await request(app).post(path).send(input);
			});

			afterAll(async () => {
				await prisma.account.delete({ where: { id: account.id } });
				await prisma.user.delete({ where: { id: user.id } });
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`The phone number has already existed`
				);
			});
		});
	});
});
