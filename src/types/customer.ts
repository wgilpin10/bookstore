export interface CustomerOrderSummary {
  orderId: string;
  bookTitle: string;
  quantity: number;
  revenue: number;
  profit: number;
  soldAt: string;
}

/** One recorded sale that may contain multiple books. */
export interface CustomerSaleGroup {
  saleId: string;
  soldAt: string;
  totalRevenue: number;
  totalProfit: number;
  items: CustomerOrderSummary[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  totalProfit: number;
  orderCount: number;
  lastOrderAt: string;
  rank?: number;
  /** Multi-book sales available for the expandable dropdown. */
  sales: CustomerSaleGroup[];
}

export interface SaleLineRecord {
  orderId: string;
  bookId: string;
  bookTitle: string;
  author: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
  profit: number;
}

export interface SaleRecord {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  soldAt: string;
  totalRevenue: number;
  totalProfit: number;
  items: SaleLineRecord[];
  createdAt: string;
}
