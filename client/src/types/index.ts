// Enums
export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum ProductUnit {
  UNKNOWN = 'UNKNOWN',
}

export enum ProductStatus {
  GOOD = 'GOOD',
  EXPIRED = 'EXPIRED',
}

export enum EmployeePosition {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  RECEIVING = 'RECEIVING',
}

// Product Types
export interface Product {
  id: number
  name: string | null
  unit: ProductUnit
  price: number
  barcode: number
  amount: number
  status: ProductStatus
}

export interface ProductWithDetails extends Product {
  promotionDetails?: PromotionDetail[]
  invoiceDetails?: InvoiceDetail[]
  goodReceiptDetails?: GoodReceiptDetail[]
  slotDetails?: SlotDetail[]
  stocktakingDetails?: StocktakingDetail[]
}

// Promotion Types
export interface Promotion {
  id: number
  name: string
  description: string | null
  startedAt: string
  endedAt: string
  condition: string | null
  value: number
  promotionType: PromotionType
}

export interface PromotionWithDetails extends Promotion {
  promotionDetails?: PromotionDetail[]
  invoiceDetails?: InvoiceDetail[]
}

export interface PromotionDetail {
  productId: number
  promotionId: number
  product?: Product
  promotion?: Promotion
}

// User Types
export interface User {
  id: number
  name: string
  point: number
}

export interface UserWithDetails extends User {
  invoices?: Invoice[]
  accounts?: Account[]
}

// Account Types
export interface Account {
  id: number
  userId: number
  phoneNumber: string
  passwordHash: string
  salt: string
  loggedAt: string
  user?: User
}

// Employee Types
export interface Employee {
  id: number
  name: string
  position: EmployeePosition
}

export interface EmployeeWithDetails extends Employee {
  invoices?: Invoice[]
  goodReceipts?: GoodReceipt[]
  stocktakings?: Stocktaking[]
  employeeAccounts?: EmployeeAccount[]
}

export interface EmployeeAccount {
  id: number
  employeeId: number
  username: string
  passwordHash: string
  salt: string
  loggedAt: string
  employee?: Employee
}

// Invoice Types
export interface Invoice {
  id: number
  employeeId: number
  userId: number | null
  usedPoint: number
  total: number
  createdAt: string
}

export interface InvoiceWithDetails extends Invoice {
  employee?: Employee
  user?: User
  invoiceDetails?: InvoiceDetail[]
}

export interface InvoiceDetail {
  invoiceId: number
  productId: number
  quantity: number
  promotionId: number | null
  invoice?: Invoice
  product?: Product
  promotion?: Promotion
}

// Good Receipt Types
export interface GoodReceipt {
  id: number
  employeeId: number
  createdAt: string
}

export interface GoodReceiptWithDetails extends GoodReceipt {
  employee?: Employee
  goodReceiptDetails?: GoodReceiptDetail[]
}

export interface GoodReceiptDetail {
  goodReceiptId: number
  productId: number
  quantity: number
  price: number
  goodReceipt?: GoodReceipt
  product?: Product
}

// Shelf, Rack, Slot Types
export interface Shelf {
  id: number
  name: string
  racks?: Rack[]
}

export interface Rack {
  id: number
  name: string
  shelfId: number
  shelf?: Shelf
  slots?: Slot[]
}

export interface Slot {
  id: number
  name: string
  rackId: number
  rack?: Rack
  slotDetails?: SlotDetail[]
  stocktakingDetails?: StocktakingDetail[]
}

export interface SlotDetail {
  slotId: number
  productId: number
  slot?: Slot
  product?: Product
}

// Stocktaking Types
export interface Stocktaking {
  id: number
  employeeId: number
  createdAt: string
}

export interface StocktakingWithDetails extends Stocktaking {
  employee?: Employee
  stocktakingDetails?: StocktakingDetail[]
}

export interface StocktakingDetail {
  id: number
  stocktakingId: number
  productId: number
  slotId: number
  status: ProductStatus
  quantity: number
  stocktaking?: Stocktaking
  product?: Product
  slot?: Slot
}

// Auth Types
export interface SignInRequest {
  phoneNumber?: string  // For user login
  username?: string     // For employee login
  password: string
}

export interface SignInResponse {
  accessToken: string
  user?: User
  employee?: Employee
}

export interface SignUpRequest {
  name: string
  phoneNumber: string
  password: string
}

export interface CreateEmployeeAccountRequest {
  employeeId: number
  username: string
  password: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Create/Update Request Types
export interface CreateProductRequest {
  name: string | null
  unit?: ProductUnit
  price: number
  barcode: number
  amount?: number
  status?: ProductStatus
}

export interface UpdateProductRequest {
  name?: string | null
  unit?: ProductUnit
  price?: number
  barcode?: number
  amount?: number
  status?: ProductStatus
}

export interface CreatePromotionRequest {
  name: string
  description?: string | null
  startedAt: string
  endedAt: string
  condition?: string | null
  value: number
  promotionType: PromotionType
  productIds?: number[]
}

export interface CreateInvoiceRequest {
  employeeId: number
  userId?: number | null
  usedPoint?: number
  details: {
    productId: number
    quantity: number
    promotionId?: number | null
  }[]
}

export interface CreateGoodReceiptRequest {
  employeeId: number
  details: {
    productId: number
    quantity: number
    price: number
  }[]
}

export interface CreateStocktakingRequest {
  products: {
    barcode: number
    slotId: number
    status: ProductStatus
    quantity: number
  }[]
}
