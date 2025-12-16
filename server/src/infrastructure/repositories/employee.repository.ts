import { PrismaClient } from "@prisma/client";
import { Employee } from "../../domain/entities/employee";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class EmployeeRepository implements EmployeeRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async getById(id: number) {
		const raw = await this.prisma.employee.findUnique({
			where: { id },
			...EmployeeRepository.baseQuery,
		});

		if (!raw) return null;

		const savedEntity = fromPersistence(Employee, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}


	async add(employee: Employee, tx?: any) {
		const repo = tx || this.prisma;
		const raw = await repo.employee.create({
			data: toPersistenceObject(employee),
			...EmployeeRepository.baseQuery,
		});

		const savedEntity = fromPersistence(Employee, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	async updateById(employee: Employee, tx?: any) {
		const repo = tx || this.prisma;
		const raw = await repo.employee.update({
			where: { id: employee.id },
			data: toPersistenceObject(employee),
			...EmployeeRepository.baseQuery,
		});
		const savedEntity = fromPersistence(Employee, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	async save(employee: Employee, tx?: any) {
		return this.updateById(employee, tx);
	}

	static baseQuery = buildSafePrismaSelect(Employee);
}
