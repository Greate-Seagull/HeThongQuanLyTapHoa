import express from "express";
import productRouter from "./presentation/routes/product.route";
import promotionRouter from "./presentation/routes/promotion.route";
import invoiceRouter from "./presentation/routes/invoice.route";
import goodReceiptRouter from "./presentation/routes/good-receipt.route";
import stocktakingRouter from "./presentation/routes/stocktaking.route";
import accountRouter from "./presentation/routes/account.route";
import employeeAccountRouter from "./presentation/routes/employee-account.route";

const app = express();

app.use(express.json());
app.use("/products", productRouter);
app.use("/promotions", promotionRouter);
app.use("/invoices", invoiceRouter);
app.use("/good-receipts", goodReceiptRouter);
app.use("/stocktakings", stocktakingRouter);
app.use("/accounts", accountRouter);
app.use("/employee-accounts", employeeAccountRouter);

export default app;
