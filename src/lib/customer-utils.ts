import { Customer } from "@/types/customer";

export type CustomerRankBy = "profit" | "sales";

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export function compareCustomersBy(
  a: Customer,
  b: Customer,
  rankBy: CustomerRankBy
): number {
  if (rankBy === "sales") {
    if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
    if (b.totalProfit !== a.totalProfit) return b.totalProfit - a.totalProfit;
  } else {
    if (b.totalProfit !== a.totalProfit) return b.totalProfit - a.totalProfit;
    if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
  }

  if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
  return normalizePhone(a.phone).localeCompare(normalizePhone(b.phone));
}

export function rankCustomers(
  customers: Customer[],
  rankBy: CustomerRankBy
): Customer[] {
  return [...customers]
    .sort((a, b) => compareCustomersBy(a, b, rankBy))
    .map((customer, index) => ({
      ...customer,
      rank: index + 1,
    }));
}

/** Prefer the richest record when duplicate phone numbers exist. */
export function pickCanonicalCustomer(matches: Customer[]): Customer {
  return [...matches].sort((a, b) => {
    const aScore = a.totalProfit + a.totalSpent + a.orderCount;
    const bScore = b.totalProfit + b.totalSpent + b.orderCount;
    return bScore - aScore || Number(a.id) - Number(b.id);
  })[0];
}

export function dedupeCustomersByPhone(customers: Customer[]): Customer[] {
  const byPhone = new Map<string, Customer[]>();

  for (const customer of customers) {
    const phoneKey = normalizePhone(customer.phone);
    if (!phoneKey) continue;
    const list = byPhone.get(phoneKey) ?? [];
    list.push(customer);
    byPhone.set(phoneKey, list);
  }

  return Array.from(byPhone.values()).map(pickCanonicalCustomer);
}
