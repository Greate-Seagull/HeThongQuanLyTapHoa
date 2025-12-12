export interface ProductCategory {
  id: number
  name: string
  description?: string
}

export interface CreateProductCategoryDTO {
  name: string
  description?: string
}

export interface UpdateProductCategoryDTO {
  id: number
  name?: string
  description?: string
}
