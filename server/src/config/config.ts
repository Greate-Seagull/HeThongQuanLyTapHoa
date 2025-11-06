import "dotenv/config";

export const config = {
	postgres: {
		URL: process.env.DATABASE_URL,
	},
};
