import express from "express";
import jsend from "jsend";
import cors from "cors";
import productRouter from "./presentation/routes/product.route";
import promotionRouter from "./presentation/routes/promotion.route";
import invoiceRouter from "./presentation/routes/invoice.route";
import goodReceiptRouter from "./presentation/routes/good-receipt.route";
import stocktakingRouter from "./presentation/routes/stocktaking.route";
import accountRouter from "./presentation/routes/account.route";
import employeeAccountRouter from "./presentation/routes/employee-account.route";
import supplierRouter from "./presentation/routes/supplier.route";
import productCategoryRouter from "./presentation/routes/product-category.route";
import { reportRouter } from "./presentation/routes/report.route";
import * as compositionRoot from "./composition-root";

const app = express();

// CORS configuration - Allow frontend to access API
const corsOptions = {
  origin: [
    'http://localhost:3000',      // Development - Frontend port 3000
    'http://localhost:3001',      // Development - Frontend port 3001
    'http://localhost:3002',      // Development - Frontend port 3002
    // Add production URLs when deploying
    // 'https://your-frontend.netlify.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(jsend.middleware);
app.use("/products", productRouter);
app.use("/promotions", promotionRouter);
app.use("/invoices", invoiceRouter);
app.use("/good-receipts", goodReceiptRouter);
app.use("/stocktakings", stocktakingRouter);
app.use("/accounts", accountRouter);
app.use("/employee-accounts", employeeAccountRouter);
app.use("/suppliers", supplierRouter);
app.use("/product-categories", productCategoryRouter);
app.use("/reports", reportRouter({
	getInventoryReportUsecase: compositionRoot.getInventoryReportUsecase,
	getGoodsReceiptReportUsecase: compositionRoot.getGoodsReceiptReportUsecase,
	getSalesReportUsecase: compositionRoot.getSalesReportUsecase,
	getCustomerReportUsecase: compositionRoot.getCustomerReportUsecase,
	getStocktakingReportUsecase: compositionRoot.getStocktakingReportUsecase,
	getRevenueProfitReportUsecase: compositionRoot.getRevenueProfitReportUsecase,
}));

export default app;
