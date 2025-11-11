import { hash } from "bcrypt";
import "dotenv/config";

export const config = {
	postgres: {
		URL: String(process.env.DATABASE_URL),
	},

	port: 3000,

	bcrypt: {
		saltRound: Number(process.env.SALT_ROUND),
	},

	jwt: {
		secret: process.env.JWT_SECRET,
		expiry: process.env.JWT_EXPIRY,
	},
};
