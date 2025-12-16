import { Read, Required, Type, Write } from "../types/decorators";

export type UserId = number | null;

export class User {
	private _id: UserId = null;
	private _name: string = null;
	private _point: number = 0;

	private constructor() {}

	usePoints(usedPoint: number) {
		if (usedPoint < 0) throw Error(`Invalid used points: ${usedPoint}`);
		this.point -= usedPoint;
		console.log(this._point);
	}

	earnPoints(totalValue: number) {
		if (totalValue < 0) throw Error(`Invalid earn points: ${totalValue}`);
		this.point += Math.floor(totalValue / 100);
	}

	// Setters
	private set id(value: UserId) {
		if (value < 0) throw Error(`Invalid id, ${value}`);
		this._id = value;
	}
	private set name(value: string) {
		this._name = value;
	}
	private set point(value: number) {
		if (value < 0) throw Error(`Invalid point, ${value}`);
		this._point = value;
	}

	// Getters
	@Read
	@Type(Number)
	get id(): UserId {
		return this._id;
	}
	@Read
	@Write
	@Required
	@Type(String)
	get name(): string {
		return this._name;
	}
	@Read
	@Write
	@Type(Number)
	get point(): number {
		return this._point;
	}
}
