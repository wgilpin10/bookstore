import { getMonthKey, formatMonthLabel } from "@/lib/order-utils";
import { Customer } from "@/types/customer";
import { Order } from "@/types/order";

export interface MonthPoint {
  monthKey: string;
  label: string;
  value: number;
}

export interface BookSalesPoint {
  book: string;
  quantity: number;
}

function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

/** Last 12 calendar months ending at the current month (inclusive). */
export function getPastYearMonthKeys(now = new Date()): string[] {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  let cursor = `${year}-${month}`;
  const keys: string[] = [];

  for (let i = 0; i < 12; i += 1) {
    keys.unshift(cursor);
    cursor = shiftMonthKey(cursor, -1);
  }

  return keys;
}

export function buildProfitOverPastYear(orders: Order[]): MonthPoint[] {
  const monthKeys = getPastYearMonthKeys();
  const profitByMonth = new Map<string, number>();

  for (const key of monthKeys) {
    profitByMonth.set(key, 0);
  }

  for (const order of orders) {
    const key = getMonthKey(order.soldAt);
    if (!profitByMonth.has(key)) continue;
    profitByMonth.set(key, (profitByMonth.get(key) ?? 0) + (order.profit || 0));
  }

  return monthKeys.map((monthKey) => ({
    monthKey,
    label: formatMonthLabel(monthKey),
    value: Number((profitByMonth.get(monthKey) ?? 0).toFixed(2)),
  }));
}

function customerFirstSeenAt(customer: Customer): string {
  if (customer.sales.length > 0) {
    const earliest = [...customer.sales].sort((a, b) => {
      const aTime = new Date(a.soldAt).getTime();
      const bTime = new Date(b.soldAt).getTime();
      return (
        (Number.isNaN(aTime) ? Number.POSITIVE_INFINITY : aTime) -
        (Number.isNaN(bTime) ? Number.POSITIVE_INFINITY : bTime)
      );
    })[0];
    if (earliest?.soldAt) return earliest.soldAt;
  }

  return customer.lastOrderAt || "";
}

/**
 * Cumulative customer count over the past year.
 * Uses earliest known sale (or last order) as the acquisition date.
 */
export function buildCustomersOverTime(customers: Customer[]): MonthPoint[] {
  const monthKeys = getPastYearMonthKeys();
  const firstMonth = monthKeys[0];
  const acquiredByMonth = new Map<string, number>();

  for (const key of monthKeys) {
    acquiredByMonth.set(key, 0);
  }

  let beforeWindow = 0;

  for (const customer of customers) {
    const firstSeen = customerFirstSeenAt(customer);
    const key = getMonthKey(firstSeen);
    if (!key) continue;

    if (key < firstMonth) {
      beforeWindow += 1;
      continue;
    }

    if (acquiredByMonth.has(key)) {
      acquiredByMonth.set(key, (acquiredByMonth.get(key) ?? 0) + 1);
    }
  }

  let running = beforeWindow;
  return monthKeys.map((monthKey) => {
    running += acquiredByMonth.get(monthKey) ?? 0;
    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      value: running,
    };
  });
}

export function buildTopBooksSold(
  orders: Order[],
  limit = 10
): BookSalesPoint[] {
  const byBook = new Map<string, number>();

  for (const order of orders) {
    const title = order.bookTitle?.trim() || "Untitled";
    byBook.set(title, (byBook.get(title) ?? 0) + (order.quantity || 0));
  }

  return Array.from(byBook.entries())
    .map(([book, quantity]) => ({ book, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.book.localeCompare(b.book))
    .slice(0, limit);
}
