import { User } from "../../domain/user";

export class UserMapper {
	static toPersistence(user: User) {
		return {
			name: user.name,
			point: user.point,
		};
	}

	static toDomain(raw: any) {
		return User.rehydrate(raw);
	}
}
