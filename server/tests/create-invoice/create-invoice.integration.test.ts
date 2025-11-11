import { createInvoiceUsecase, prisma } from "../../src/composition-root";
import {
	employee,
	product1,
	product2,
	promotion1,
	promotion2,
	send,
	user,
} from "./create-invoice.test-data";

jest.setTimeout(50000);

describe("Create invoice integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await Promise.all([
			prisma.employee.create({ data: employee as any }),
			prisma.user.create({ data: user }),
			prisma.product.createMany({ data: [product1, product2] }),
		]);
		await Promise.all([
			prisma.promotion.create({ data: promotion1 as any }),
			prisma.promotion.create({ data: promotion2 as any }),
		]);
	});

	afterAll(async () => {
		await prisma.invoice.deleteMany({
			where: { employeeId: employee.id },
		});
		await Promise.all([
			prisma.employee.delete({ where: { id: employee.id } }),
			prisma.user.delete({ where: { id: user.id } }),
			prisma.product.deleteMany({
				where: { id: { in: [product1.id, product2.id] } },
			}),
			prisma.promotion.deleteMany({
				where: { id: { in: [promotion1.id, promotion2.id] } },
			}),
		]);
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await createInvoiceUsecase.execute(input);
		});

		it(`Should return correct employee id`, () => {
			expect(output.employee.employeeId).toBe(employee.id);
		});

		it(`Should return correct user id`, () => {
			expect(output.user.userId).toBe(user.id);
		});

		it(`Should return correct used point`, () => {
			expect(output.usedPoint).toBe(0);
		});

		it(`Should return correct products size`, () => {
			expect(output.products).toHaveLength(send.items.length);
		});

		it(`Should return correct total`, () => {
			expect(output.total).toBe(480000);
		});
	});
});
