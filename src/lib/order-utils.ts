import { Order, OrderStats } from "@/types/order";

export function getMonthKey(date: Date | string): string {
  if (typeof date === "string") {
    // Use the year-month from the API date_time string directly.
    const match = date.match(/^(\d{4})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;
  }

  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function filterOrdersByMonth(
  orders: Order[],
  monthFilter: string
): Order[] {
  if (monthFilter === "all") return orders;
  if (monthFilter === "current") {
    const current = getCurrentMonthKey();
    return orders.filter((order) => getMonthKey(order.soldAt) === current);
  }
  return orders.filter((order) => getMonthKey(order.soldAt) === monthFilter);
}

export function getAvailableMonths(orders: Order[]): string[] {
  const months = new Set(orders.map((order) => getMonthKey(order.soldAt)));
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function calculateOrderStats(
  allOrders: Order[],
  filteredOrders: Order[]
): OrderStats {
  const currentMonth = getCurrentMonthKey();
  const profit = filteredOrders.reduce((sum, order) => sum + order.profit, 0);
  const revenue = filteredOrders.reduce((sum, order) => sum + order.revenue, 0);
  const currentMonthOrderCount = allOrders.filter(
    (order) => getMonthKey(order.soldAt) === currentMonth
  ).length;

  return {
    profit,
    revenue,
    orderCount: filteredOrders.length,
    currentMonthOrderCount,
  };
}

export function formatSoldAt(soldAt: string): string {
  if (!soldAt) return "—";

  // Prefer wall-clock components from the API string so "11:41Z" still reads as 11:41.
  const match = soldAt.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  const date = match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6] ?? 0)
      )
    : new Date(soldAt);

  if (Number.isNaN(date.getTime())) return soldAt;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
