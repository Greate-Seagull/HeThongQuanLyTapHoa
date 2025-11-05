import { prisma } from "../src/composition-root";

async function checkDB() {
	return await prisma.product.findMany();
}

console.log(checkDB());
