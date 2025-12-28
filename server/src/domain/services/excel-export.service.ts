import ExcelJS from "exceljs";

export class ExcelExportService {
	// Helper to configure page setup for PDF export
	private configurePageSetup(worksheet: ExcelJS.Worksheet) {
		worksheet.pageSetup = {
			paperSize: 9, // A4
			orientation: "landscape", // Ngang để vừa nhiều cột hơn
			fitToPage: true,
			fitToWidth: 1, // Vừa chiều rộng trong 1 trang
			fitToHeight: 0, // Không giới hạn chiều cao, để tự động xuống trang
			margins: {
				left: 0.25,
				right: 0.25,
				top: 0.75,
				bottom: 0.75,
				header: 0.3,
				footer: 0.3,
			},
			printArea: undefined, // Tự động xác định vùng in
			horizontalCentered: true, // Căn giữa theo chiều ngang
		};

		// Cấu hình in ấn
		worksheet.properties.defaultRowHeight = 15;
	}

	// Export inventory report
	async exportInventoryReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Tồn Kho");

		// Header styling
		worksheet.columns = [
			{ header: "Mã SP", key: "id", width: 10 },
			{ header: "Tên sản phẩm", key: "name", width: 30 },
			{ header: "Mã vạch", key: "barcode", width: 15 },
			{ header: "Số lượng", key: "amount", width: 12 },
			{ header: "Đơn vị", key: "unit", width: 10 },
			{ header: "Giá", key: "price", width: 15 },
			{ header: "Trạng thái", key: "status", width: 12 },
			{ header: "Nhà cung cấp", key: "supplier", width: 20 },
			{ header: "Loại SP", key: "category", width: 20 },
			{ header: "Vị trí", key: "location", width: 30 },
		];

		// Add data
		data.products.forEach((product: any) => {
			worksheet.addRow({
				id: product.id,
				name: product.name,
				barcode: product.barcode,
				amount: product.amount,
				unit: product.unit,
				price: product.price,
				status: product.status,
				supplier: product.supplier,
				category: product.category,
				location:
					product.locations.map((l: any) => l.fullLocation).join(", ") ||
					"Chưa xếp kho",
			});
		});

		// Style header row
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF4472C4" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}

	// Export goods receipt report
	async exportGoodsReceiptReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Nhập Hàng");

		worksheet.columns = [
			{ header: "Mã phiếu", key: "id", width: 10 },
			{ header: "Ngày nhập", key: "createdAt", width: 20 },
			{ header: "Nhân viên", key: "employee", width: 25 },
			{ header: "Tổng SL", key: "totalQuantity", width: 12 },
			{ header: "Tổng tiền", key: "totalAmount", width: 18 },
		];

		data.goodReceipts.forEach((gr: any) => {
			worksheet.addRow({
				id: gr.id,
				createdAt: new Date(gr.createdAt).toLocaleString("vi-VN"),
				employee: gr.employee,
				totalQuantity: gr.totalQuantity,
				totalAmount: gr.totalAmount.toLocaleString("vi-VN") + "đ",
			});
		});

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF70AD47" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}

	// Export sales report
	async exportSalesReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Bán Hàng");

		worksheet.columns = [
			{ header: "Mã HĐ", key: "id", width: 10 },
			{ header: "Nhân viên", key: "employee", width: 25 },
			{ header: "Khách hàng", key: "customer", width: 25 },
			{ header: "SL sản phẩm", key: "totalQuantity", width: 12 },
			{ header: "Điểm dùng", key: "usedPoint", width: 12 },
			{ header: "Tổng tiền", key: "total", width: 18 },
		];

		data.sales.forEach((sale: any) => {
			worksheet.addRow({
				id: sale.id,
				employee: sale.employee,
				customer: sale.customer,
				totalQuantity: sale.totalQuantity,
				usedPoint: sale.usedPoint,
				total: sale.total.toLocaleString("vi-VN") + "đ",
			});
		});

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFC000" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}

	// Export customer report
	async exportCustomerReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Khách Hàng");

		worksheet.columns = [
			{ header: "Mã KH", key: "id", width: 10 },
			{ header: "Tên KH", key: "name", width: 30 },
			{ header: "SĐT", key: "phoneNumber", width: 15 },
			{ header: "Điểm hiện tại", key: "currentPoints", width: 15 },
			{ header: "Điểm đã dùng", key: "totalPointsUsed", width: 15 },
			{ header: "Tổng chi tiêu", key: "totalSpent", width: 18 },
			{ header: "Số đơn hàng", key: "totalPurchases", width: 12 },
		];

		data.customers.forEach((customer: any) => {
			worksheet.addRow({
				id: customer.id,
				name: customer.name,
				phoneNumber: customer.phoneNumber,
				currentPoints: customer.currentPoints,
				totalPointsUsed: customer.totalPointsUsed,
				totalSpent: customer.totalSpent.toLocaleString("vi-VN") + "đ",
				totalPurchases: customer.totalPurchases,
			});
		});

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF5B9BD5" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}

	// Export stocktaking report
	async exportStocktakingReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Kiểm Kê");

		worksheet.columns = [
			{ header: "Mã phiếu", key: "id", width: 10 },
			{ header: "Ngày kiểm", key: "createdAt", width: 20 },
			{ header: "Nhân viên", key: "employee", width: 25 },
			{ header: "Tổng SP", key: "totalProducts", width: 12 },
			{ header: "Chênh lệch", key: "totalDiscrepancy", width: 15 },
		];

		data.stocktakings.forEach((st: any) => {
			worksheet.addRow({
				id: st.id,
				createdAt: new Date(st.createdAt).toLocaleString("vi-VN"),
				employee: st.employee,
				totalProducts: st.totalProducts,
				totalDiscrepancy: st.totalDiscrepancy,
			});
		});

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFED7D31" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}

	// Export revenue/profit report
	async exportRevenueProfitReport(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo Cáo Doanh Thu - Lợi Nhuận");

		if (data.groupBy === "product") {
			worksheet.columns = [
				{ header: "Tên sản phẩm", key: "productName", width: 30 },
				{ header: "Mã vạch", key: "barcode", width: 15 },
				{ header: "Loại SP", key: "category", width: 20 },
				{ header: "Số lượng bán", key: "quantity", width: 15 },
				{ header: "Doanh thu", key: "revenue", width: 20 },
			];

			data.data.forEach((item: any) => {
				worksheet.addRow({
					productName: item.productName,
					barcode: item.barcode,
					category: item.category,
					quantity: item.quantity,
					revenue: item.revenue.toLocaleString("vi-VN") + "đ",
				});
			});
		} else if (data.groupBy === "category") {
			worksheet.columns = [
				{ header: "Loại sản phẩm", key: "category", width: 30 },
				{ header: "Số lượng bán", key: "quantity", width: 15 },
				{ header: "Doanh thu", key: "revenue", width: 20 },
			];

			data.data.forEach((item: any) => {
				worksheet.addRow({
					category: item.category,
					quantity: item.quantity,
					revenue: item.revenue.toLocaleString("vi-VN") + "đ",
				});
			});
		}

		// Add summary row
		worksheet.addRow({});
		worksheet.addRow({
			productName: "TỔNG KẾT:",
		});
		worksheet.addRow({
			productName: "Tổng doanh thu:",
			barcode: data.totalRevenue.toLocaleString("vi-VN") + "đ",
		});
		worksheet.addRow({
			productName: "Tổng chi phí:",
			barcode: data.totalCost.toLocaleString("vi-VN") + "đ",
		});
		worksheet.addRow({
			productName: "Lợi nhuận:",
			barcode: data.totalProfit.toLocaleString("vi-VN") + "đ",
		});
		worksheet.addRow({
			productName: "Tỷ suất lợi nhuận:",
			barcode: data.profitMargin + "%",
		});

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF70AD47" },
		};

		return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
	}
}
