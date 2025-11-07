import { User } from "../../domain/user";

export class UserMapper {
	static toPersistence(user: User) {
		return {
			id: user.id,
			name: user.name,
			point: user.point,
		}
	}

	static toDomain(raw: any) {
		return User.rehydrate(raw);
	}
}
