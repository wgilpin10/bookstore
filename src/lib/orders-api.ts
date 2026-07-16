import { ORDERS_API_URL } from "@/lib/config";
import { CreateOrderInput, Order } from "@/types/order";

interface ApiOrder {
  id: number;
  date_time?: string | null;
  book?: string | null;
  author?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  revenue?: number | null;
  profit?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  name?: string | null;
  phone?: string | null;
}

interface ApiOrdersResponse {
  success: boolean;
  count?: number;
  data: ApiOrder[];
  error?: string;
}

interface ApiCreateOrderResponse {
  success: boolean;
  data?: {
    order: ApiOrder;
    book?: {
      id: number;
      title: string;
      remaining_quantity: number;
    };
  };
  error?: string;
  message?: string;
}

function mapApiOrder(apiOrder: ApiOrder): Order {
  const quantity = Number(apiOrder.quantity ?? 0);
  const unitPrice = Number(apiOrder.unit_price ?? 0);
  const profit = Number(apiOrder.profit ?? 0);
  const revenue = Number(apiOrder.revenue ?? 0);
  const unitCost =
    quantity > 0 && Number.isFinite(unitPrice) && Number.isFinite(profit)
      ? unitPrice - profit / quantity
      : 0;

  const customerName =
    apiOrder.customer_name?.trim() || apiOrder.name?.trim() || undefined;
  const customerPhone =
    apiOrder.customer_phone?.trim() || apiOrder.phone?.trim() || undefined;

  return {
    id: String(apiOrder.id),
    bookId: "",
    bookTitle: apiOrder.book?.trim() || "Untitled",
    author: apiOrder.author?.trim() || "Unknown",
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    unitCost: Number.isFinite(unitCost) ? unitCost : 0,
    revenue: Number.isFinite(revenue) ? revenue : 0,
    profit: Number.isFinite(profit) ? profit : 0,
    soldAt: apiOrder.date_time == null ? "" : String(apiOrder.date_time),
    customerName,
    customerPhone,
  };
}

export async function fetchOrdersFromApi(): Promise<Order[]> {
  const response = await fetch(ORDERS_API_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders (${response.status})`);
  }

  const json: ApiOrdersResponse = await response.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.error ?? "Invalid orders API response");
  }

  return json.data
    .map(mapApiOrder)
    .sort((a, b) => {
      const aTime = a.soldAt ? new Date(a.soldAt).getTime() : 0;
      const bTime = b.soldAt ? new Date(b.soldAt).getTime() : 0;
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
        return Number(b.id) - Number(a.id);
      }
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime || Number(b.id) - Number(a.id);
    });
}

/** Convert datetime-local value to API date_time without timezone shift. */
export function toApiDateTime(localDateTime: string): string {
  const match = localDateTime.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/
  );
  if (!match) {
    throw new Error("Enter a valid sale date and time.");
  }
  const seconds = match[3] ?? "00";
  return `${match[1]} ${match[2]}:${seconds}`;
}

export async function createOrderInApi(
  input: CreateOrderInput
): Promise<Order> {
  const quantity = Number(input.quantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Enter a valid quantity of at least 1.");
  }

  const bookId = Number(input.bookId);
  if (!Number.isFinite(bookId)) {
    throw new Error("Select a book to sell.");
  }

  const payload: Record<string, string | number> = {
    book_id: bookId,
    quantity,
  };

  if (input.soldAt) {
    payload.date_time = input.soldAt.includes("T")
      ? toApiDateTime(input.soldAt)
      : input.soldAt;
  }

  if (input.customerName?.trim()) {
    payload.customer_name = input.customerName.trim();
  }

  if (input.customerPhone?.trim()) {
    payload.customer_phone = input.customerPhone.trim();
  }

  const response = await fetch(ORDERS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json: ApiCreateOrderResponse = await response.json();

  if (!response.ok || !json.success || !json.data?.order) {
    throw new Error(
      json.error ?? json.message ?? `Failed to create order (${response.status})`
    );
  }

  const order = mapApiOrder(json.data.order);

  // Ensure customer fields are preserved even if API doesn't echo them yet.
  return {
    ...order,
    customerName: order.customerName ?? input.customerName?.trim(),
    customerPhone: order.customerPhone ?? input.customerPhone?.trim(),
    bookId: order.bookId || String(bookId),
  };
}
