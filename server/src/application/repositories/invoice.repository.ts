import { Invoice } from "../../domain/entities/invoice";
import { BaseRepository } from "./base.repository";

export interface InvoiceRepository extends BaseRepository<Invoice> {}
