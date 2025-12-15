export interface ProductCategoryReadAccessor {
	getCategories(): Promise<
		{
			id: number;
			name: string;
			description: string;
			_count: { products: number };
		}[]
	>;
	getCategoryById(
		id: number
	): Promise<{
		id: number;
		name: string;
		description: string;
		products: { id: number; name: string; price: number }[];
	}>;
	existById(id: number): Promise<boolean>;
}
