import { passwordService } from "../../src/composition-root";

export const employee = {
	id: 10000,
	name: "use account",
	position: "SALES",
};

const salt = passwordService.generateSalt();
const password = "use account";

export const account = {
	id: 10000,
	employeeId: employee.id,
	username: "use account",
	salt: salt,
	passwordHash: passwordService.hashPassword(password, salt),
};

export const send = {
	username: account.username,
	password: password,
};
