import dotenv from "dotenv";

let t = dotenv.config({ path: "../.env" });

const config = {
	port: process.env.PORT,
};

export default config;
