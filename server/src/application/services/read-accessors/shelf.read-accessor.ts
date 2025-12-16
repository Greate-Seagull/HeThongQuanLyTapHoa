export interface ShelfReadAccessor {
	existSlotByIds(ids: number[]): Promise<boolean>;
}
