import { Book, BookStockStatus } from "@/types/book";
import { getBookStockStatus } from "@/lib/utils";

export type FilterOperator = "any" | "above" | "below" | "equals";
export type StockStatusFilter = "all" | BookStockStatus;

export interface BookFilters {
  stockStatus: StockStatusFilter;
  quantityOperator: FilterOperator;
  quantityValue: string;
  priceOperator: FilterOperator;
  priceValue: string;
}

export const defaultBookFilters: BookFilters = {
  stockStatus: "all",
  quantityOperator: "any",
  quantityValue: "",
  priceOperator: "any",
  priceValue: "",
};

function matchesNumericFilter(
  value: number,
  operator: FilterOperator,
  rawThreshold: string
): boolean {
  if (operator === "any") return true;

  const threshold = Number(rawThreshold);
  if (!Number.isFinite(threshold)) return true;

  switch (operator) {
    case "above":
      return value > threshold;
    case "below":
      return value < threshold;
    case "equals":
      return value === threshold;
    default:
      return true;
  }
}

export function matchesBookFilters(book: Book, filters: BookFilters): boolean {
  if (
    filters.stockStatus !== "all" &&
    getBookStockStatus(book) !== filters.stockStatus
  ) {
    return false;
  }

  if (!matchesNumericFilter(book.quantity, filters.quantityOperator, filters.quantityValue)) {
    return false;
  }

  if (!matchesNumericFilter(book.price, filters.priceOperator, filters.priceValue)) {
    return false;
  }

  return true;
}

export function hasActiveFilters(filters: BookFilters): boolean {
  return (
    filters.stockStatus !== "all" ||
    filters.quantityOperator !== "any" ||
    filters.priceOperator !== "any"
  );
}

export function countActiveFilters(filters: BookFilters): number {
  let count = 0;
  if (filters.stockStatus !== "all") count += 1;
  if (filters.quantityOperator !== "any") count += 1;
  if (filters.priceOperator !== "any") count += 1;
  return count;
}
