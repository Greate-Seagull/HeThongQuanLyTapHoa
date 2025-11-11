import { prisma, signInUsecase } from "../../src/composition-root";
import { account, send, user } from "./sign-in.test-data";

jest.setTimeout(20000);

describe("Sign in integration test", () => {
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
			output = await signInUsecase.execute(input);
		});

		it("Should return jwt", () => {
			expect(output).toHaveProperty("token");
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid phone number case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.phoneNumber = "-1";
				try {
					output = await signInUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Invalid phone number or password`);
			});
		});

		describe("Invalid password case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.password = "-1";
				try {
					output = await signInUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Invalid phone number or password`);
			});
		});
	});
});
