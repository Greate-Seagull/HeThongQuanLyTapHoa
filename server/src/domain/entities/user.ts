import { Read, Write } from "../../types/decorators";
import { BaseEntity } from "../abstracts/entity";

export type UserId = number | null;

export class User extends BaseEntity<UserId> {
	private _name: string = null;
	private _point: number = 0;

	public static create(name: string) {
		let entity = new User();
		entity.name = name;
		entity.point = 0;
		return entity;
	}

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
	private set name(value: string) {
		this._name = value;
	}
	private set point(value: number) {
		if (value < 0) throw Error(`Invalid point, ${value}`);
		this._point = value;
	}

	// Getters
	@Read
	@Write
	get name(): string {
		return this._name;
	}
	@Read
	@Write
	get point(): number {
		return this._point;
	}
}
