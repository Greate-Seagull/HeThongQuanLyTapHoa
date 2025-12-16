import app from "./src/app";
import { config } from "./src/config/config";
import stocktakingRoute from "./src/presentation/routes/stocktaking.route";
import shelfRoute from "./src/presentation/routes/shelf.route";

// Register routes
app.use("/api/stocktakings", stocktakingRoute);
app.use("/api/shelves", shelfRoute);

app.listen(config.port, (error) => {
	if (error) throw error;
	console.log(`Listening to http://localhost:${config.port}`);
});
