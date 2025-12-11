import pino from "pino";

export class PinoLogger {
	constructor(private readonly logger: pino.Logger) {}

	debug(message: string, context: object = {}) {
		this.logger.debug({ ...context }, message);
	}

	info(message: string, context: object = {}) {
		this.logger.info({ ...context }, message);
	}

	warn(message: string, context: object = {}) {
		this.logger.warn({ ...context }, message);
	}

	error(message: string, context: object = {}) {
		this.logger.error({ ...context }, message);
	}

	child(context: object): PinoLogger {
		const childLogger = this.logger.child(context);
		return new PinoLogger(childLogger);
	}
}

export function maskPhone(phone: string) {
	return phone.replace(/\d(?=\d{4})/g, "*");
}

export const logger = new PinoLogger(
	pino({
		level: process.env.LOG_LEVEL || "debug",
		transport: {
			target: "pino-pretty",
			options: { colorize: true },
		},
	})
);
