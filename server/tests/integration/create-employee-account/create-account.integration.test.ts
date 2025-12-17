import z from "zod";
import { createAccountUsecase, prisma } from "../../../src/composition-root";
import { employee, employeeAccount, send } from "./create-account.test-data";

jest.setTimeout(20000);

const outputSchema = z.object();

describe("Create account integration test", () => {
	let input;
	let output;

	beforeAll(async () => {});

	afterAll(async () => {});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await createAccountUsecase.execute(input);
		});

		afterAll(async () => {
			await prisma.employeeAccount.deleteMany({
				where: { username: send.username },
			});
			await prisma.employee.deleteMany({
				where: { name: send.name },
			});
		});

		it("Should return success message", () => {
			expect(() => outputSchema.parse(output)).not.toThrow();
		});
	});

	describe("Abnormal case", () => {
		describe("Existed username case", () => {
			beforeAll(async () => {
				// Ensure cleanup before setup
				await prisma.employeeAccount.deleteMany({ where: { username: employeeAccount.username }});
				await prisma.employee.deleteMany({ where: { id: employee.id }});

				await prisma.employee.create({ data: employee as any });
				await prisma.employeeAccount.create({ data: employeeAccount });

				input = structuredClone(send);
				input.username = employeeAccount.username;
				try {
					output = await createAccountUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			afterAll(async () => {
				await prisma.employeeAccount.delete({
					where: { id: employeeAccount.id },
				});
				await prisma.employee.delete({ where: { id: employee.id } });
			});

			it("Should return error message", () => {
				expect(output.message).toMatch(/Unique constraint/);
			});
		});

		describe("Invalid position case", () => {
			// beforeAll(async () => {
			// 	input = structuredClone(send);
			// 	input.position = "UNKNOWN";
			// 	try {
			// 		output = await createAccountUsecase.execute(input);
			// 	} catch (e) {
			// 		output = e;
			// 	}
			// });

			// it("Should return error message", () => {
			// 	expect(output.message).toMatch(/Invalid value for argument/);
			// });
		});
	});
});
