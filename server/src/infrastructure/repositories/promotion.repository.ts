import { Prisma, PrismaClient } from "@prisma/client";

export class PromotionRepository implements PromotionRepository {
	constructor(private readonly prisma: PrismaClient) {}
}
