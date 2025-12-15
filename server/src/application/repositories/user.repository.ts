import { User } from "../../domain/entities/user";
import { BaseRepository } from "./base.repository";

export interface UserRepository extends BaseRepository<User> {}
