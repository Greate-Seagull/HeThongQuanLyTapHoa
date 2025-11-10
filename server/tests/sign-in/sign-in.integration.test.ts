import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { account, send, user } from "./sign-in.test-data";

jest.setTimeout(20000);

describe("Sign in integration test", () => {
	let path = `/accounts/sign-in`;
	let input;
	let output;

	beforeAll(async () => {
		await prisma.user.create({ data: user });
		await prisma.account.create({ data: account });
	});

	afterAll(async () => {
		await prisma.account.delete({ where: { id: account.id } });
		await prisma.user.delete({ where: { id: user.id } });
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return jwt", () => {
			expect(output.body).toHaveProperty("token");
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid phone number case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.phoneNumber = "-1";
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Invalid phone number or password`
				);
			});
		});

		describe("Invalid password case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.password = "-1";
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Invalid phone number or password`
				);
			});
		});
	});
});
