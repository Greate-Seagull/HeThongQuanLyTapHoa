import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { send } from "./use-account.test-data";

jest.setTimeout(20000);

describe("Use account integration test", () => {
	let path = `/employee-accounts/sign-in`;
	let input;
	let output;

	beforeAll(async () => {});

	afterAll(async () => {});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});
	});
});
