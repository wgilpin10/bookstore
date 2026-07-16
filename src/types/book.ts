export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  cost_price?: number;
  status?: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  price: number;
  quantity: number;
  cost_price?: number;
}

export type UpdateBookInput = CreateBookInput;

export type BookStockStatus = "Out of Stock" | "Low in Stock" | "In Stock";

export interface BookStats {
  totalBooks: number;
  totalInventory: number;
  totalValue: number;
  uniqueAuthors: number;
  lowStockCount: number;
  averagePrice: number;
}
