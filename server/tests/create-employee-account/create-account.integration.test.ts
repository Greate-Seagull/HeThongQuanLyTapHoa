import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { employee, employeeAccount, send } from "./create-account.test-data";

jest.setTimeout(20000);

describe("Create account integration test", () => {
	let path = `/employee-accounts`;
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
			await prisma.employeeAccount.deleteMany({
				where: { username: send.username },
			});
			await prisma.employee.deleteMany({
				where: { name: send.name },
			});
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});
	});

	describe("Abnormal case", () => {
		describe("Existed username case", () => {
			beforeAll(async () => {
				await prisma.employee.create({ data: employee as any });
				await prisma.employeeAccount.create({ data: employeeAccount });

				input = structuredClone(send);
				input.username = employeeAccount.username;
				output = await request(app).post(path).send(input);
			});

			afterAll(async () => {
				await prisma.employeeAccount.delete({
					where: { id: employeeAccount.id },
				});
				await prisma.employee.delete({ where: { id: employee.id } });
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`The username has already existed`
				);
			});
		});

		describe("Invalid position case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.position = "UNKNOWN";
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty("message");
			});
		});
	});
});
