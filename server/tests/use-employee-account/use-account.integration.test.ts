import { prisma, useAccountUsecase } from "../../src/composition-root";
import { account, employee, send } from "./use-account.test-data";

jest.setTimeout(20000);

describe("Use account integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await prisma.employee.create({ data: employee as any });
		await prisma.employeeAccount.create({ data: account as any });
	});

	afterAll(async () => {
		await prisma.employeeAccount.delete({ where: { id: account.id } });
		await prisma.employee.delete({ where: { id: employee.id } });
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await useAccountUsecase.execute(input);
		});

		it("Should return jwt", () => {
			expect(output).toHaveProperty("token");
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid phone number case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.username = "-1";
				try {
					output = await useAccountUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Invalid username or password`);
			});
		});

		describe("Invalid password case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.password = "-1";
				try {
					output = await useAccountUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Invalid username or password`);
			});
		});
	});
});
