export interface Order {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  revenue: number;
  profit: number;
  soldAt: string;
  customerName?: string;
  customerPhone?: string;
}

export interface SaleLineInput {
  bookId: string;
  quantity: number;
}

export interface CreateSaleInput {
  customerName: string;
  customerPhone: string;
  soldAt?: string;
  items: SaleLineInput[];
}

/** @deprecated Prefer CreateSaleInput for multi-book sales */
export interface CreateOrderInput {
  bookId: string;
  quantity: number;
  soldAt?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface UpdateOrderInput {
  bookTitle: string;
  author: string;
  quantity: number;
  unitPrice: number;
  revenue?: number;
  profit?: number;
  soldAt?: string;
}

export interface OrderStats {
  profit: number;
  revenue: number;
  orderCount: number;
  currentMonthOrderCount: number;
}

