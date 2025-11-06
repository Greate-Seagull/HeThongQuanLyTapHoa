import { prisma } from "../composition-root";

async function checkDB() {
	const result = await prisma.promotion.findMany();
	console.log(result);
}

checkDB();
