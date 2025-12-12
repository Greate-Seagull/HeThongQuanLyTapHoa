export interface Supplier {
  id: number
  name: string
  address?: string
  phoneNumber?: string
}

export interface CreateSupplierDTO {
  name: string
  address?: string
  phoneNumber?: string
}

export interface UpdateSupplierDTO {
  id: number
  name?: string
  address?: string
  phoneNumber?: string
}
