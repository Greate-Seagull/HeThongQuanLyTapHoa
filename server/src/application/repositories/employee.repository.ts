import { Employee } from "../../domain/entities/employee";
import { BaseRepository } from "./base.repository";

export interface EmployeeRepository extends BaseRepository<Employee> {}
