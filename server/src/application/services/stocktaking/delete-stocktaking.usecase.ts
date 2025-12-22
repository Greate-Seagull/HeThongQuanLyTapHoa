import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
	id: z.number().positive(),
	authId: z.number().positive(),
});

const outputSchema = z.object({});

export class DeleteStocktakingUsecase {
	constructor(
		private readonly stocktakingRepo: StocktakingRepository,
		private readonly employeeRead: EmployeeReadAccessor
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		
		const log = logger.child({
			task: "Deleting stocktaking",
			stocktakingId: parsedInput.id,
		});
		log.info("Task started");

		// Verify exists
		const existing = await this.stocktakingRepo.getById(parsedInput.id);
		if (!existing) {
			throw Error(`Stocktaking with id ${parsedInput.id} not found`);
		}

		// Verify employee
		const employee = await this.employeeRead.getById(parsedInput.authId);
		if (!employee || (employee.position !== 'INVENTORY' && employee.position !== 'MANAGER')) {
			throw Error('Employee not authorized');
		}

		await this.stocktakingRepo.delete(parsedInput.id);
		
		log.info("Task completed");
		return outputSchema.parse({});
	}
}
