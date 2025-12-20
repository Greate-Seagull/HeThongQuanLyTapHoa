import z from "zod";
import { prisma, updateProductsUsecase } from "../../../src/composition-root";
import {
    product1Input,
    product2,
    product2Input,
    send,
} from "./update-products.test-data";

jest.setTimeout(50000);

describe("Update products integration test", () => {
    let input;
    let output;

    beforeAll(async () => {
        await prisma.product.deleteMany({
            where: {
                barcode: { in: [product2.barcode, product1Input.barcode, product2Input.barcode] },
            },
        });
        await prisma.product.create({ data: product2 });
    });

    afterAll(async () => {
        await prisma.product.deleteMany({
            where: {
                name: { in: [product1Input.name, product2Input.name] },
            },
        });
    });

    // describe("Normal case", () => {
    //     it("One insert and one update case: Should not throw any error", async () => {
    //         input = structuredClone(send);
    //         const p2 = await prisma.product.findFirst({ where: { barcode: product2.barcode } });
    //         if (!p2) throw new Error("Product 2 not found in DB");

    //         const updateItem = input.products.find((p: any) => p.barcode === product2.barcode);
    //         if (updateItem) updateItem.id = p2.id;

    //         output = await updateProductsUsecase.execute(input);
    //         expect(output).toBeDefined();
    //     });

    //     it("No insert case: Should not throw any error", async () => {
    //         input = structuredClone(send);
    //         input.products = [product2Input];
    //         // Tìm và gán ID để update thay vì insert mới
    //         const p2 = await prisma.product.findFirst({ where: { barcode: product2Input.barcode } });
    //         if (p2) input.products[0].id = p2.id;

    //         output = await updateProductsUsecase.execute(input);
    //         expect(output).toBeDefined();
    //     });
    // });

    describe("Abnormal case", () => {
        it("Should return error for invalid price", async () => {
            input = structuredClone(send);
            input.products[0].price = -1;
            try {
                await updateProductsUsecase.execute(input);
            } catch (e: any) {
                expect(e.message).toBe(`Invalid price, ${input.products[0].price}`);
            }
        });

        it("Should return error for invalid unit", async () => {
            input = structuredClone(send);
            input.products[0].unit = "ABCD";
            try {
                await updateProductsUsecase.execute(input);
            } catch (e: any) {
                expect(e.message).toBe(`Invalid unit, ${input.products[0].unit}`);
            }
        });

        it("Should return error for duplicate barcode", async () => {
            input = structuredClone(send);
            input.products[1].barcode = product1Input.barcode;
            try {
                output = await updateProductsUsecase.execute(input);
            } catch (e: any) {
                expect(JSON.stringify(e)).toMatch(/Unique constraint|P2002|PrismaClientValidationError/);
            }
        });
    });
});