import z from "zod";
import {
	LineItems,
	ProcessedLineItem,
	processedLineItemSchema,
} from "../../application/invoice/create-invoice.usecase";
import { Product, ProductId } from "../product";
import { Promotion, PromotionId } from "../promotion";
import { User } from "../user";

export class SalesTransactionService {
	processSale(input: ProcessInvoiceInput): ProcessedInvoiceOutput {
		const productMap = new Map(input.products.map((p) => [p.id, p]));
		const promotionMap = new Map(input.promotions.map((p) => [p.id, p]));
		let items = computeItemSnapshot(productMap, promotionMap, input.items);
		let total = computeTotal(items);
		total = applyUsedPoints(input.user, input.usedPoint, total);
		reduceStocks(productMap, input.items);
		return outputSchema.parse({ items, total });

		function applyUsedPoints(user: User, usedPoint: number, total: number) {
			if (user && usedPoint) {
				total -= usedPoint;
				user.usePoints(usedPoint);
				user.earnPoints(total);
			}
			return total;
		}

		function reduceStocks(
			products: Map<number, Product>,
			items: LineItems
		) {
			for (const item of items) {
				const product = products.get(item.productId);
				product.sellStock(item.quantity);
			}
		}

		function computeItemSnapshot(
			products: Map<ProductId, Product>,
			promotions: Map<PromotionId, Promotion>,
			items: LineItems
		): ProcessedLineItem[] {
			let computedItems: ProcessedLineItem[] = [];
			for (const item of items) {
				const product = products.get(item.productId);
				const promotion = promotions.get(item.promotionId);
				const discountedPrice = promotion
					? promotion.applyDiscount(product)
					: product.price;

				const loggedItem = processedLineItemSchema.parse({
					productId: product.id,
					productName: product.name,
					quantity: item.quantity,
					originalPrice: product.price,
					discountedPrice: discountedPrice,
					promotionId: promotion ? promotion.id : null,
					promotionName: promotion ? promotion.name : "",
					subTotal: discountedPrice * item.quantity,
				});

				computedItems.push(loggedItem);
			}
			return computedItems;
		}

		function computeTotal(computedItems: ProcessedLineItem[]) {
			let total = 0;
			for (const item of computedItems) {
				total += item.subTotal;
			}
			return total;
		}
	}
}

export interface ProcessInvoiceInput {
	user: User | null;
	usedPoint: number;
	products: Product[];
	promotions: Promotion[];
	items: LineItems;
}

const outputSchema = z.object({
	items: z.array(processedLineItemSchema),
	total: z.number(),
});

type ProcessedInvoiceOutput = z.infer<typeof outputSchema>;
