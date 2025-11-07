import app from "./app.js";
import { config } from "./config/config.js";

app.listen(config.port, (error) => {
	if (error) throw error;
	console.log(`Listening to http://localhost:${config.port}`);
});
