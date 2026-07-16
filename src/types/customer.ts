export interface CustomerOrderSummary {
  orderId: string;
  bookTitle: string;
  quantity: number;
  revenue: number;
  profit: number;
  soldAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  totalProfit: number;
  orderCount: number;
  lastOrderAt: string;
  orders: CustomerOrderSummary[];
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
  customerName: string;
  customerPhone: string;
  soldAt: string;
  totalRevenue: number;
  totalProfit: number;
  items: SaleLineRecord[];
  createdAt: string;
}
