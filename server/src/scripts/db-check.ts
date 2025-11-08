import { invoiceRepo, prisma } from "../composition-root";

async function checkDB() {
	const result = await prisma.product.findMany();
	console.log(result);
}

checkDB();
// prisma.$on("query", (e) => {
// 	console.log("Query: " + e.query);
// 	console.log("Duration: " + e.duration + "ms");
// });
