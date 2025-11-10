import app from "./app";
import { config } from "./config/config";

app.listen(config.port, (error) => {
	if (error) throw error;
	console.log(`Listening to http://localhost:${config.port}`);
});
