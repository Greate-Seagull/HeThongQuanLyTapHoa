import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";

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
export const authenticationTokenSchema = z.object({
	id: z.number(),
	position: z.string(),
});
export type AuthenticationTokenPayload = z.infer<
	typeof authenticationTokenSchema
>;

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
