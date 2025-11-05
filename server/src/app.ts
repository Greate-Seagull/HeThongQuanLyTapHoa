import express from "express";
import productRouter from "./presentation/routes/product.route";
import promotionRouter from "./presentation/routes/promotion.route";

const app = express();

app.use(express.json());
app.use("/products", productRouter);
app.use("/promotions", promotionRouter);

export default app;
