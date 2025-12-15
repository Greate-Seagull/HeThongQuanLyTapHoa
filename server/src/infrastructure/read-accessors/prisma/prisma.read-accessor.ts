import { PrismaClient } from "../../../generated/client";

export abstract class PrismaReadAccessor {
	constructor(protected readonly client: PrismaClient) {}
}
