import app from "./src/app";
import { config } from "./src/config/config";

app.listen(config.port, (error) => {
	if (error) throw error;
	console.log(`Listening to http://localhost:${config.port}`);
});
