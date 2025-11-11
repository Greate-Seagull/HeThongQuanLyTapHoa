import { prisma, signUpUsecase } from "../../src/composition-root";
import { account, send, user } from "./sign-up.test-data";

jest.setTimeout(20000);

describe("Sign up integration test", () => {
	let input;
	let output;

	beforeAll(async () => {});

	afterAll(async () => {});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await signUpUsecase.execute(input);
		});

		afterAll(async () => {
			await prisma.account.delete({
				where: { phoneNumber: input.phoneNumber },
			});
			await prisma.user.deleteMany({
				where: { name: input.name },
			});
		});

		it("Should return jwt", () => {
			expect(output).toHaveProperty("token");
		});
	});

	describe("Abnormal case", () => {
		describe("Existed phone number case", () => {
			beforeAll(async () => {
				await prisma.user.create({ data: user });
				await prisma.account.create({ data: account });

				input = structuredClone(send);
				input.phoneNumber = account.phoneNumber;
				try {
					output = await signUpUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			afterAll(async () => {
				await prisma.account.delete({ where: { id: account.id } });
				await prisma.user.delete({ where: { id: user.id } });
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`The phone number has already existed`
				);
			});
		});
	});
});
