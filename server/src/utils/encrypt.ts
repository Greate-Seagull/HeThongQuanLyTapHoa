import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

export class PasswordService {
	constructor(private readonly saltRound: number) {}

	generateSalt() {
		return bcrypt.genSaltSync(this.saltRound);
	}

	hashPassword(barePassword: string, salt: string): string {
		return bcrypt.hashSync(barePassword, salt);
	}
}

export type Expiry = `${number}${"s" | "m" | "h" | "d"}`;

export class TokenService {
	constructor(
		private readonly secret: jwt.Secret,
		private readonly expiry: Expiry
	) {}

	generateJWT(id: number) {
		const payload = { id };
		const options: SignOptions = { expiresIn: this.expiry };
		return jwt.sign(payload, this.secret, options);
	}
}
