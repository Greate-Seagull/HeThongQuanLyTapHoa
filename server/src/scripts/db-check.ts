import { Product } from "../domain/entities/product";
import { toSnapshot } from "../domain/services/mapper.service";

async function checkDB() {
	const product = Product.create({
		name: "test",
		price: 1000,
		unit: "PIECE",
		amount: 1000
	});
	const snapshot = toSnapshot(product);
	console.dir(snapshot, {
		depth: null,
	});
}

checkDB();

// prisma.$on("query", (e) => {
// 	console.log("Query: " + e.query);
// 	console.log("Duration: " + e.duration + "ms");
// });
