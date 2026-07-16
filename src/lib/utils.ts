import { Book, BookStats, BookStockStatus } from "@/types/book";

const LOW_STOCK_THRESHOLD = 10;

export function getBookStockStatus(book: Book): BookStockStatus {
  if (book.status) {
    const normalized = book.status.trim().toLowerCase();
    if (normalized === "out of stock") return "Out of Stock";
    if (normalized === "low in stock" || normalized === "low stock") {
      return "Low in Stock";
    }
    if (normalized === "in stock") return "In Stock";
  }

  if (book.quantity === 0) return "Out of Stock";
  if (book.quantity < LOW_STOCK_THRESHOLD) return "Low in Stock";
  return "In Stock";
}

export function calculateBookStats(books: Book[]): BookStats {
  const totalInventory = books.reduce((sum, book) => sum + book.quantity, 0);
  const totalValue = books.reduce(
    (sum, book) => sum + book.price * book.quantity,
    0
  );
  const uniqueAuthors = new Set(books.map((book) => book.author)).size;
  const lowStockCount = books.filter(
    (book) =>
      getBookStockStatus(book) === "Low in Stock"
  ).length;
  const averagePrice =
    books.length > 0
      ? books.reduce((sum, book) => sum + book.price, 0) / books.length
      : 0;

  return {
    totalBooks: books.length,
    totalInventory,
    totalValue,
    uniqueAuthors,
    lowStockCount,
    averagePrice,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export { LOW_STOCK_THRESHOLD };
