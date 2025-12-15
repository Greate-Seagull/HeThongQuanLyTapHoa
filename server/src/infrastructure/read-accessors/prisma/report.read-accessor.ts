import { PrismaClient } from "@prisma/client";

export class ReportReadAccessor {
	constructor(private prisma: PrismaClient) {}

	// Báo cáo tồn kho
	async getInventoryReport(lowStockThreshold: number = 10) {
		const products = await this.prisma.product.findMany({
			include: {
				supplier: true,
				category: true,
				slotDetails: {
					include: {
						slot: {
							include: {
								rack: {
									include: {
										shelf: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				amount: "asc",
			},
		});

		return products.map((product) => ({
			id: product.id,
			name: product.name,
			barcode: product.barcode,
			amount: product.amount,
			unit: product.unit,
			price: product.price,
			status: product.status,
			supplier: product.supplier?.name || "N/A",
			category: product.category?.name || "N/A",
			isLowStock: product.amount <= lowStockThreshold,
			locations: product.slotDetails.map((sd) => ({
				shelf: sd.slot.rack.shelf.name,
				rack: sd.slot.rack.name,
				slot: sd.slot.name,
				fullLocation: `${sd.slot.rack.shelf.name} - ${sd.slot.rack.name} - ${sd.slot.name}`,
			})),
		}));
	}

	// Báo cáo nhập hàng
	async getGoodsReceiptReport(params: {
		startDate?: Date;
		endDate?: Date;
		supplierId?: number;
	}) {
		const { startDate, endDate, supplierId } = params;

		const goodReceipts = await this.prisma.goodReceipt.findMany({
			where: {
				...(startDate || endDate
					? {
							createdAt: {
								...(startDate ? { gte: startDate } : {}),
								...(endDate ? { lte: endDate } : {}),
							},
					  }
					: {}),
			},
			include: {
				employee: true,
				goodReceiptDetails: {
					include: {
						product: {
							include: {
								supplier: true,
							},
						},
					},
					...(supplierId
						? {
								where: {
									product: {
										supplierId: supplierId,
									},
								},
						  }
						: {}),
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return goodReceipts.map((gr) => ({
			id: gr.id,
			createdAt: gr.createdAt,
			employee: gr.employee.name,
			employeePosition: gr.employee.position,
			totalAmount: gr.goodReceiptDetails.reduce(
				(sum, detail) => sum + detail.quantity * detail.price,
				0
			),
			totalQuantity: gr.goodReceiptDetails.reduce(
				(sum, detail) => sum + detail.quantity,
				0
			),
			details: gr.goodReceiptDetails.map((detail) => ({
				productName: detail.product.name,
				productBarcode: detail.product.barcode,
				quantity: detail.quantity,
				price: detail.price,
				totalPrice: detail.quantity * detail.price,
				supplier: detail.product.supplier?.name || "N/A",
			})),
		}));
	}

	// Báo cáo bán hàng
	async getSalesReport(params: {
		startDate?: Date;
		endDate?: Date;
		employeeId?: number;
		userId?: number;
	}) {
		const { startDate, endDate, employeeId, userId } = params;

		const invoices = await this.prisma.invoice.findMany({
			where: {
				...(employeeId ? { employeeId } : {}),
				...(userId ? { userId } : {}),
				...(startDate || endDate
					? {
							createdAt: {
								...(startDate ? { gte: startDate } : {}),
								...(endDate ? { lte: endDate } : {}),
							},
					  }
					: {}),
			},
			include: {
				employee: true,
				user: true,
				invoiceDetails: {
					include: {
						product: {
							include: {
								category: true,
							},
						},
						promotion: true,
					},
				},
			},
			orderBy: {
				id: "desc",
			},
		});

		return invoices.map((invoice) => ({
			id: invoice.id,
			createdAt: invoice.createdAt, // Add createdAt field
			employee: invoice.employee.name,
			employeePosition: invoice.employee.position,
			customer: invoice.user?.name || "Khách vãng lai",
			customerPhone: invoice.user
				? `ID: ${invoice.user.id}`
				: "N/A",
			usedPoint: invoice.usedPoint,
			total: invoice.total,
			totalQuantity: invoice.invoiceDetails.reduce(
				(sum, detail) => sum + detail.quantity,
				0
			),
			details: invoice.invoiceDetails.map((detail) => ({
				productName: detail.product.name,
				productBarcode: detail.product.barcode,
				productPrice: detail.product.price,
				quantity: detail.quantity,
				category: detail.product.category?.name || "N/A",
				promotion: detail.promotion?.name || "Không có",
				promotionValue: detail.promotion?.value || 0,
				promotionType: detail.promotion?.promotionType || null,
			})),
		}));
	}

	// Báo cáo khách hàng thành viên
	async getCustomerReport(orderBy: "point" | "totalSpent" = "point") {
		const users = await this.prisma.user.findMany({
			include: {
				invoices: {
					include: {
						invoiceDetails: true,
					},
				},
				accounts: true,
			},
		});

		const customerData = users.map((user) => {
			const totalSpent = user.invoices.reduce(
				(sum, invoice) => sum + invoice.total,
				0
			);
			const totalPurchases = user.invoices.length;
			const totalPointsUsed = user.invoices.reduce(
				(sum, invoice) => sum + invoice.usedPoint,
				0
			);

			return {
				id: user.id,
				name: user.name,
				currentPoints: user.point,
				totalPointsUsed,
				phoneNumber: user.accounts[0]?.phoneNumber || "N/A",
				totalSpent,
				totalPurchases,
				averageSpent:
					totalPurchases > 0
						? Math.round(totalSpent / totalPurchases)
						: 0,
			};
		});

		// Sort by requested field
		if (orderBy === "point") {
			return customerData.sort((a, b) => b.currentPoints - a.currentPoints);
		} else {
			return customerData.sort((a, b) => b.totalSpent - a.totalSpent);
		}
	}

	// Báo cáo kiểm kê
	async getStocktakingReport(params: {
		startDate?: Date;
		endDate?: Date;
		hasDiscrepancy?: boolean;
	}) {
		const { startDate, endDate, hasDiscrepancy } = params;

		const stocktakings = await this.prisma.stocktaking.findMany({
			where: {
				...(startDate || endDate
					? {
							createdAt: {
								...(startDate ? { gte: startDate } : {}),
								...(endDate ? { lte: endDate } : {}),
							},
					  }
					: {}),
			},
			include: {
				employee: true,
				stocktakingDetails: {
					include: {
						product: true,
						slot: {
							include: {
								rack: {
									include: {
										shelf: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return stocktakings.map((st) => {
			const details = st.stocktakingDetails.map((detail) => {
				const systemQuantity = detail.product.amount;
				const actualQuantity = detail.quantity;
				const discrepancy = actualQuantity - systemQuantity;

				return {
					productName: detail.product.name,
					productBarcode: detail.product.barcode,
					location: `${detail.slot.rack.shelf.name} - ${detail.slot.rack.name} - ${detail.slot.name}`,
					systemQuantity,
					actualQuantity,
					discrepancy,
					hasDiscrepancy: discrepancy !== 0,
					status: detail.status,
				};
			});

			// Filter by discrepancy if requested
			const filteredDetails =
				hasDiscrepancy !== undefined
					? details.filter((d) =>
							hasDiscrepancy ? d.hasDiscrepancy : !d.hasDiscrepancy
					  )
					: details;

			return {
				id: st.id,
				createdAt: st.createdAt,
				employee: st.employee.name,
				employeePosition: st.employee.position,
				totalProducts: filteredDetails.length,
				totalDiscrepancy: filteredDetails.reduce(
					(sum, d) => sum + Math.abs(d.discrepancy),
					0
				),
				details: filteredDetails,
			};
		});
	}

	// Thống kê doanh thu và lợi nhuận
	async getRevenueProfitReport(params: {
		startDate?: Date;
		endDate?: Date;
		groupBy?: "product" | "category" | "time";
	}) {
		const { startDate, endDate, groupBy = "time" } = params;

		// Get sales data
		const invoices = await this.prisma.invoice.findMany({
			where: {
				...(startDate || endDate
					? {
							createdAt: {
								...(startDate ? { gte: startDate } : {}),
								...(endDate ? { lte: endDate } : {}),
							},
					  }
					: {}),
			},
			include: {
				invoiceDetails: {
					include: {
						product: {
							include: {
								category: true,
								goodReceiptDetails: true,
							},
						},
					},
				},
			},
		});

		// Get cost data from good receipts
		const goodReceipts = await this.prisma.goodReceipt.findMany({
			where: {
				...(startDate || endDate
					? {
							createdAt: {
								...(startDate ? { gte: startDate } : {}),
								...(endDate ? { lte: endDate } : {}),
							},
					  }
					: {}),
			},
			include: {
				goodReceiptDetails: true,
			},
		});

		// Calculate total revenue
		const totalRevenue = invoices.reduce(
			(sum, invoice) => sum + invoice.total,
			0
		);

		// Calculate total cost (from good receipts)
		const totalCost = goodReceipts.reduce(
			(sum, gr) =>
				sum +
				gr.goodReceiptDetails.reduce(
					(grSum, detail) => grSum + detail.quantity * detail.price,
					0
				),
			0
		);

		const totalProfit = totalRevenue - totalCost;

		// Group by product
		if (groupBy === "product") {
			const productStats = new Map<
				number,
				{
					productName: string;
					barcode: number;
					revenue: number;
					quantity: number;
					category: string;
				}
			>();

			invoices.forEach((invoice) => {
				invoice.invoiceDetails.forEach((detail) => {
					const existing = productStats.get(detail.productId) || {
						productName: detail.product.name || "N/A",
						barcode: detail.product.barcode,
						revenue: 0,
						quantity: 0,
						category: detail.product.category?.name || "N/A",
					};

					existing.revenue += detail.quantity * detail.product.price;
					existing.quantity += detail.quantity;

					productStats.set(detail.productId, existing);
				});
			});

			return {
				totalRevenue,
				totalCost,
				totalProfit,
				profitMargin:
					totalRevenue > 0
						? ((totalProfit / totalRevenue) * 100).toFixed(2)
						: 0,
				groupBy: "product",
				data: Array.from(productStats.values()).sort(
					(a, b) => b.revenue - a.revenue
				),
			};
		}

		// Group by category
		if (groupBy === "category") {
			const categoryStats = new Map<
				string,
				{ revenue: number; quantity: number }
			>();

			invoices.forEach((invoice) => {
				invoice.invoiceDetails.forEach((detail) => {
					const categoryName =
						detail.product.category?.name || "Không phân loại";
					const existing = categoryStats.get(categoryName) || {
						revenue: 0,
						quantity: 0,
					};

					existing.revenue += detail.quantity * detail.product.price;
					existing.quantity += detail.quantity;

					categoryStats.set(categoryName, existing);
				});
			});

			return {
				totalRevenue,
				totalCost,
				totalProfit,
				profitMargin:
					totalRevenue > 0
						? ((totalProfit / totalRevenue) * 100).toFixed(2)
						: 0,
				groupBy: "category",
				data: Array.from(categoryStats.entries())
					.map(([category, stats]) => ({
						category,
						...stats,
					}))
					.sort((a, b) => b.revenue - a.revenue),
			};
		}

		// Default: time-based summary
		return {
			totalRevenue,
			totalCost,
			totalProfit,
			profitMargin:
				totalRevenue > 0
					? ((totalProfit / totalRevenue) * 100).toFixed(2)
					: 0,
			totalInvoices: invoices.length,
			totalGoodReceipts: goodReceipts.length,
			averageInvoiceValue:
				invoices.length > 0
					? Math.round(totalRevenue / invoices.length)
					: 0,
			groupBy: "time",
		};
	}
}
