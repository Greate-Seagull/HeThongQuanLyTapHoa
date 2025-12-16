export interface ShelfReadAccessor {
	existSlotByIds(ids: number[]): Promise<boolean>;
	getShelvesWithRacksAndSlots(): Promise<any[]>;
}
