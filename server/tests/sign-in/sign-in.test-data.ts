import { passwordService } from "../../src/composition-root";

export const user = {
	id: 10000,
	name: "sign in",
};

const salt = passwordService.generateSalt();
const password = "sign in";

export const account = {
	id: 10000,
	userId: user.id,
	phoneNumber: "1234567899",
	salt: salt,
	passwordHash: passwordService.hashPassword(password, salt),
};

export const send = {
	phoneNumber: account.phoneNumber,
	password: password,
};
