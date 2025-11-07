import { Employee } from "./employee";
import { User } from "./user";

export class Invoice {
	private _id?: number;
	private _employeeId!: number;
	private _userId?: number;
	private _usedPoint!: number;
	private _total!: number;
	private _invoiceDetails: InvoiceDetail[];

	private constructor() {}

	static create(input: InvoiceCreateProps): Invoice {
		let invoice = new Invoice();

		invoice._employeeId = input.employee.id;
		invoice.updateUserInfo(input.user, input.usedPoint);
		invoice._total = input.total;
		invoice.updateDetails(input.items);

		return invoice;
	}

	private updateDetails(items: InvoiceDetailCreateProps[]) {
		if (items.length < 1)
			throw Error(
				`Expect invoice to have at least one item, got ${items}`
			);

		this._invoiceDetails = items.map(InvoiceDetail.create);
	}

	private updateUserInfo(user: User, usedPoint: number): void {
		this._userId = null;
		this._usedPoint = 0;
		if (user) {
			this._userId = user.id;
			if (usedPoint) this._usedPoint = usedPoint;
		}
	}

	static rehydrate(raw: InvoiceRehydrateProps): Invoice {
		let invoice = new Invoice();

		invoice._id = raw.id;
		invoice._employeeId = raw.employeeId;
		invoice._userId = raw.userId;
		invoice._usedPoint = raw.usedPoint;
		invoice._total = raw.total;
		invoice._invoiceDetails = raw.invoiceDetails.map(
			InvoiceDetail.rehydrate
		);

		return invoice;
	}

	get id(): number | undefined {
		return this._id;
	}
	get employeeId(): number {
		return this._employeeId;
	}
	get userId(): number | undefined {
		return this._userId;
	}
	get usedPoint(): number {
		return this._usedPoint;
	}
	get total(): number {
		return this._total;
	}
	get invoiceDetails() {
		return this._invoiceDetails;
	}
}

export interface InvoiceCreateProps {
	employee: Employee;
	user: User;
	usedPoint: number;
	total: number;
	items: InvoiceDetailCreateProps[];
}

export interface InvoiceRehydrateProps {
	id: number;
	employeeId: number;
	userId: number;
	usedPoint: number;
	total: number;
	invoiceDetails: InvoiceDetailRehydrateProps[];
}

export class InvoiceDetail {
	private _invoiceId?: number;
	private _productId!: number;
	private _quantity!: number;
	private _promotionId?: number;

	private constructor() {}

	static create({
		productId,
		quantity,
		promotionId,
	}: InvoiceDetailCreateProps): InvoiceDetail {
		let e = new InvoiceDetail();

		e._productId = productId;
		e._quantity = quantity;
		e._promotionId = promotionId;

		return e;
	}

	static rehydrate({
		invoiceId,
		productId,
		quantity,
		promotionId,
	}: InvoiceDetailRehydrateProps) {
		let e = new InvoiceDetail();

		e._invoiceId = invoiceId;
		e._productId = productId;
		e._quantity = quantity;
		e._promotionId = promotionId;

		return e;
	}

	get invoiceId(): number | undefined {
		return this._invoiceId;
	}
	get productId(): number {
		return this._productId;
	}
	get quantity(): number {
		return this._quantity;
	}
	get promotionId(): number | undefined {
		return this._promotionId;
	}
}

export interface InvoiceDetailCreateProps {
	productId: number;
	quantity: number;
	promotionId: number;
}

interface InvoiceDetailRehydrateProps {
	invoiceId: number;
	productId: number;
	quantity: number;
	promotionId: number;
}
