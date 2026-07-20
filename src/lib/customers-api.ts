import { CUSTOMERS_API_URL } from "@/lib/config";
import {
  normalizePhone,
  pickCanonicalCustomer,
} from "@/lib/customer-utils";
import { Customer } from "@/types/customer";

export {
  normalizePhone,
  pickCanonicalCustomer,
  dedupeCustomersByPhone,
  rankCustomers,
  compareCustomersBy,
  type CustomerRankBy,
} from "@/lib/customer-utils";

interface ApiCustomer {
  id: number;
  rank?: number | null;
  name?: string | null;
  phone?: string | null;
  /** Separate sales count stored in the database. */
  sales?: number | null;
  /** Legacy field — some older responses may still use this. */
  orders?: number | null;
  total_spent?: number | null;
  profit?: number | null;
  last_order?: string | null;
}

interface ApiCustomersResponse {
  success: boolean;
  count?: number;
  data: ApiCustomer[];
  error?: string;
}

interface ApiCustomerResponse {
  success: boolean;
  data?: ApiCustomer;
  error?: string;
  message?: string;
}

export interface CustomerStatsInput {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  totalProfit: number;
  lastOrderAt: string;
  rank?: number | null;
}

function toApiDateTime(value: string): string {
  if (!value) return value;
  return value.includes(" ") ? value.replace(" ", "T") : value;
}

export function mapApiCustomer(apiCustomer: ApiCustomer): Customer {
  // Prefer `sales` (current DB column); fall back to legacy `orders`.
  const saleCount = Number(
    apiCustomer.sales != null ? apiCustomer.sales : apiCustomer.orders
  );
  const totalSpent = Number(apiCustomer.total_spent);
  const totalProfit = Number(apiCustomer.profit);
  const rank = Number(apiCustomer.rank);

  return {
    id: String(apiCustomer.id),
    name: apiCustomer.name?.trim() || "Unknown",
    phone: apiCustomer.phone?.trim() || "",
    totalSpent: Number.isFinite(totalSpent) ? totalSpent : 0,
    totalProfit: Number.isFinite(totalProfit) ? totalProfit : 0,
    orderCount: Number.isFinite(saleCount) ? saleCount : 0,
    lastOrderAt:
      apiCustomer.last_order == null ? "" : String(apiCustomer.last_order),
    rank: Number.isFinite(rank) ? rank : undefined,
    sales: [],
  };
}

function toApiPayload(input: CustomerStatsInput): Record<string, string | number> {
  const payload: Record<string, string | number> = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    // Persist separate-sales count to the database `sales` column.
    sales: input.orderCount,
    total_spent: input.totalSpent,
    profit: input.totalProfit,
  };

  if (input.lastOrderAt) {
    payload.last_order = toApiDateTime(input.lastOrderAt);
  }

  if (input.rank != null && Number.isFinite(input.rank)) {
    payload.rank = input.rank;
  }

  return payload;
}

export async function fetchCustomersFromApi(): Promise<Customer[]> {
  const response = await fetch(CUSTOMERS_API_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customers (${response.status})`);
  }

  const json: ApiCustomersResponse = await response.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.error ?? "Invalid customers API response");
  }

  return json.data.map(mapApiCustomer);
}

export async function createCustomerInApi(
  input: CustomerStatsInput
): Promise<Customer> {
  if (!input.name.trim()) throw new Error("Customer name is required.");
  if (!input.phone.trim()) throw new Error("Customer phone number is required.");

  const response = await fetch(CUSTOMERS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(input)),
    cache: "no-store",
  });

  const json: ApiCustomerResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.error ??
        json.message ??
        `Failed to create customer (${response.status})`
    );
  }

  return mapApiCustomer(json.data);
}

export async function updateCustomerInApi(
  id: string,
  input: CustomerStatsInput
): Promise<Customer> {
  if (!input.name.trim()) throw new Error("Customer name is required.");
  if (!input.phone.trim()) throw new Error("Customer phone number is required.");

  const response = await fetch(`${CUSTOMERS_API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(input)),
    cache: "no-store",
  });

  const json: ApiCustomerResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.error ??
        json.message ??
        `Failed to update customer (${response.status})`
    );
  }

  return mapApiCustomer(json.data);
}

/**
 * Phone number is the unique customer identity.
 * Same phone always maps to the existing customer record.
 */
export async function ensureCustomerInApi(input: {
  name: string;
  phone: string;
}): Promise<Customer> {
  const phoneKey = normalizePhone(input.phone);
  if (!phoneKey) {
    throw new Error("Customer phone number is required.");
  }

  const customers = await fetchCustomersFromApi();
  const matches = customers.filter(
    (customer) => normalizePhone(customer.phone) === phoneKey
  );

  if (matches.length > 0) {
    const existing = pickCanonicalCustomer(matches);
    const nextName = input.name.trim() || existing.name;

    if (nextName !== existing.name) {
      return updateCustomerInApi(existing.id, {
        name: nextName,
        phone: existing.phone || input.phone.trim(),
        orderCount: existing.orderCount,
        totalSpent: existing.totalSpent,
        totalProfit: existing.totalProfit,
        lastOrderAt: existing.lastOrderAt,
        rank: existing.rank,
      });
    }

    return {
      ...existing,
      name: nextName,
    };
  }

  return createCustomerInApi({
    name: input.name,
    phone: input.phone.trim(),
    orderCount: 0,
    totalSpent: 0,
    totalProfit: 0,
    lastOrderAt: "",
  });
}

/** Apply sale totals onto the existing phone-identified customer record. */
export async function applySaleToCustomerInApi(input: {
  customer: Customer;
  /** Number of separate sales to add (usually 1). */
  saleCount?: number;
  revenue: number;
  profit: number;
  soldAt: string;
}): Promise<Customer> {
  const { customer } = input;
  const saleCount = input.saleCount ?? 1;

  return updateCustomerInApi(customer.id, {
    name: customer.name,
    phone: customer.phone,
    orderCount: customer.orderCount + saleCount,
    totalSpent: customer.totalSpent + input.revenue,
    totalProfit: customer.totalProfit + input.profit,
    lastOrderAt: input.soldAt || customer.lastOrderAt,
    rank: customer.rank,
  });
}
