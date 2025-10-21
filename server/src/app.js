import express from 'express';
import productRouter from './presentation_layer/routes/product.route.js';

const app = express();

app.use(express.json());
app.use('/products', productRouter);

export default app;