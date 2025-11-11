import { ItemInput } from "../../application/create-invoice.usecase";
import { Product } from "../product";
import { Promotion } from "../promotion";
import { User } from "../user";

export class SalesTransactionService {
	processSale(input: ProcessInvoiceInput) {
		const productMap = new Map(input.products.map((p) => [p.id, p]));
		const promotionMap = new Map(input.promotions.map((p) => [p.id, p]));
		let items = computeItemSnapshot(productMap, promotionMap, input.items);
		let total = computeTotal(items);
		total = applyUsedPoints(input.user, input.usedPoint, total);
		reduceStocks(productMap, input.items);
		return createOutput(input, items, total);

		function createOutput(
			input: ProcessInvoiceInput,
			items: LineItem[],
			total: number
		): ProcessInvoiceOutput {
			return {
				user: input.user,
				usedPoint: input.usedPoint,
				products: input.products,
				promotions: input.promotions,
				items: items,
				total,
			};
		}

		function applyUsedPoints(user: User, usedPoint: number, total: number) {
			if (user) {
				total -= user.usePoints(usedPoint);
				user.earnPoints(total);
			}
			return total;
		}

		function reduceStocks(
			products: Map<number, Product>,
			items: ItemInput[]
		) {
			for (const item of items) {
				const product = products.get(item.productId);
				product.sellStock(item.quantity);
			}
		}

		function computeItemSnapshot(
			products: Map<number, Product>,
			promotions: Map<number, Promotion>,
			items: ItemInput[]
		): LineItem[] {
			let computedItems: LineItem[] = [];
			for (const item of items) {
				const product = products.get(item.productId);
				const promotion = promotions.get(item.promotionId);
				const discountedPrice = promotion
					? promotion.applyDiscount(product)
					: product.price;

				const loggedItem: LineItem = {
					productId: product.id,
					productName: product.name,
					quantity: item.quantity,
					originalPrice: product.price,
					discountedPrice: discountedPrice,
					promotionId: promotion ? promotion.id : null,
					promotionName: promotion ? promotion.name : "",
					subTotal: discountedPrice * item.quantity,
				};

				computedItems.push(loggedItem);
			}
			return computedItems;
		}

		function computeTotal(computedItems: LineItem[]) {
			let total = 0;
			for (const item of computedItems) {
				total += item.subTotal;
			}
			return total;
		}
	}
}

export interface ProcessInvoiceInput {
	user: User;
	usedPoint: number | 0;
	products: Product[];
	promotions: Promotion[];
	items: ItemInput[];
}

type LineItem = {
	productId: number;
	productName: string;
	quantity: number;
	originalPrice: number;
	discountedPrice: number;
	promotionId: number;
	promotionName: string;
	subTotal: number;
};

export interface ProcessInvoiceOutput {
	user: User;
	usedPoint: number;
	products: Product[];
	promotions: Promotion[];
	items: LineItem[];
	total: number;
}
