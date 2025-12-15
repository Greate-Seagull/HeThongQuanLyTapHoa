import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { Id } from "../abstracts/entity";

export class PasswordService {
	constructor(private readonly saltRound: number) {}

	generateSalt() {
		return bcrypt.genSaltSync(this.saltRound);
	}

	hashPassword(barePassword: string, salt: string): string {
		return bcrypt.hashSync(barePassword, salt);
	}

	comparePassword(barePassword: string, hashedPassword: string): boolean {
		return bcrypt.compareSync(barePassword, hashedPassword);
	}
}

export type Expiry = `${number}${"s" | "m" | "h" | "d"}`;
export interface AuthenticationTokenPayload {
	id: Id;
	position: string;
}

export class TokenService {
	constructor(
		private readonly secret: jwt.Secret,
		private readonly expiry: Expiry
	) {}

	generateJwt(payload: AuthenticationTokenPayload) {
		const options: SignOptions = { expiresIn: this.expiry };
		return jwt.sign(payload, this.secret, options);
	}

	verifyJwt(token: string) {
		return jwt.verify(token, this.secret);
	}
}
