import express from "express";
import productRouter from "./presentation/routes/product.route";
import promotionRouter from "./presentation/routes/promotion.route";
import invoiceRouter from "./presentation/routes/invoice.route";

const app = express();

app.use(express.json());
app.use("/products", productRouter);
app.use("/promotions", promotionRouter);
app.use("/invoices", invoiceRouter);

export default app;
