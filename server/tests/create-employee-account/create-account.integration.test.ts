import { createAccountUsecase, prisma } from "../../src/composition-root";
import { employee, employeeAccount, send } from "./create-account.test-data";

jest.setTimeout(20000);

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
			expect(output.message).toBe("Success");
		});
	});

	describe("Abnormal case", () => {
		describe("Existed username case", () => {
			beforeAll(async () => {
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
				expect(output.message).toBe(`The username has already existed`);
			});
		});

		describe("Invalid position case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.position = "UNKNOWN";
				try {
					output = await createAccountUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output).toHaveProperty("message");
			});
		});
	});
});
