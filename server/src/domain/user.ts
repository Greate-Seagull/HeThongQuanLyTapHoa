export class User {
	private _id: number;
	private _name: string;
	private _point: number;

	private constructor() {}

	static rehydrate(input: UserRehydrateProps) {
		let entity = new User();

		entity._id = input.id;
		entity._name = input.name;
		entity._point = input.point;

		return entity;
	}

	usePoints(usedPoint: number) {
		if (!usedPoint) usedPoint = 0;
		if (usedPoint > this._point)
			throw Error(
				`The used points are exceed the current user's points: ${this._point}`
			);

		this._point -= usedPoint;
		return usedPoint;
	}

	earnPoints(totalValue: number) {
		if (totalValue < 0)
			throw Error(`The total value is invalid ${totalValue}`);

		this._point += Math.floor(totalValue / 100);
	}

	get id() {
		return this._id;
	}
	get name() {
		return this._name;
	}
	get point() {
		return this._point;
	}
}

export interface UserRehydrateProps {
	id: number;
	name: string;
	point: number;
}
