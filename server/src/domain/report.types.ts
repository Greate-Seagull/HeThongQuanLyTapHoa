// Report Domain Types

export interface InventoryReportParams {
  lowStockThreshold?: number;
}

export interface InventoryReportData {
  summary: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
  };
  products: ProductInventoryItem[];
}

export interface ProductInventoryItem {
  id: number;
  name: string;
  barcode: number;
  amount: number;
  price: number;
  totalValue: number;
  status: string;
  supplier?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  locations?: Array<{
    slotId: number;
    slotName: string;
    rackName: string;
    shelfName: string;
  }>;
}

export interface GoodsReceiptReportParams {
  startDate?: string;
  endDate?: string;
  supplierId?: number;
}

export interface GoodsReceiptReportData {
  summary: {
    totalGoodReceipts: number;
    totalAmount: number;
    totalQuantity: number;
    averageAmount: number;
  };
  goodReceipts: GoodReceiptReportItem[];
}

export interface GoodReceiptReportItem {
  id: number;
  createdAt: Date;
  employeeId: number;
  employeeName: string;
  totalAmount: number;
  totalQuantity: number;
  goodReceiptDetails: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    amount: number;
    supplierName?: string;
  }>;
}

export interface SalesReportParams {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  userId?: number;
}

export interface SalesReportData {
  summary: {
    totalInvoices: number;
    totalRevenue: number;
    totalQuantity: number;
    averageInvoiceValue: number;
    totalPointsUsed: number;
  };
  sales: SalesReportItem[];
}

export interface SalesReportItem {
  id: number;
  createdAt: Date;
  employeeId: number;
  employeeName: string;
  userId?: number;
  customerName?: string;
  totalPrice: number;
  usedPoint: number;
  invoiceDetails: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    promotionName?: string;
  }>;
}

export interface CustomerReportParams {
  orderBy?: 'point' | 'totalSpent';
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number;
    totalPoints: number;
    totalSpent: number;
    totalPointsUsed: number;
    averageSpent: number;
  };
  customers: CustomerReportItem[];
}

export interface CustomerReportItem {
  id: number;
  name: string;
  phoneNumber: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalPointsUsed: number;
  totalInvoices: number;
  lastPurchase?: Date;
}

export interface StocktakingReportParams {
  startDate?: string;
  endDate?: string;
}

export interface StocktakingReportData {
  summary: {
    totalStocktakings: number;
    totalProductsChecked: number;
    totalDiscrepancies: number;
    totalDiscrepancyAmount: number;
  };
  stocktakings: StocktakingReportItem[];
}

export interface StocktakingReportItem {
  id: number;
  createdAt: Date;
  employeeId: number;
  employeeName: string;
  stocktakingDetails: Array<{
    productId: number;
    productName: string;
    slotId: number;
    slotName: string;
    rackName: string;
    shelfName: string;
    expectedQuantity: number;
    actualQuantity: number;
    discrepancy: number;
    status: string;
  }>;
}

export interface RevenueProfitReportParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'time' | 'product' | 'category';
}

export interface RevenueProfitReportData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: string;
  groupBy: string;
  data?: RevenueProfitItem[];
  totalInvoices?: number;
  totalGoodReceipts?: number;
  averageInvoiceValue?: number;
}

export interface RevenueProfitItem {
  period?: string;
  productId?: number;
  productName?: string;
  categoryId?: number;
  categoryName?: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: string;
}
