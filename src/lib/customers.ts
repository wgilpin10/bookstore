import { Customer, CustomerOrderSummary, SaleRecord } from "@/types/customer";
import { readSales } from "@/lib/sales-store";

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export async function getCustomers(): Promise<Customer[]> {
  const sales = await readSales();
  const byPhone = new Map<
    string,
    {
      name: string;
      phone: string;
      orders: CustomerOrderSummary[];
    }
  >();

  for (const sale of sales) {
    const phoneKey = normalizePhone(sale.customerPhone);
    if (!phoneKey) continue;

    const existing = byPhone.get(phoneKey) ?? {
      name: sale.customerName,
      phone: sale.customerPhone.trim(),
      orders: [],
    };

    // Prefer the most recently used name for this phone.
    existing.name = sale.customerName.trim() || existing.name;

    for (const item of sale.items) {
      existing.orders.push({
        orderId: item.orderId,
        bookTitle: item.bookTitle,
        quantity: item.quantity,
        revenue: item.revenue,
        profit: item.profit,
        soldAt: sale.soldAt,
      });
    }

    byPhone.set(phoneKey, existing);
  }

  const customers: Customer[] = Array.from(byPhone.entries()).map(
    ([phoneKey, data]) => {
      const orders = data.orders.sort((a, b) => {
        const aTime = new Date(a.soldAt).getTime();
        const bTime = new Date(b.soldAt).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });

      const totalSpent = orders.reduce((sum, order) => sum + order.revenue, 0);
      const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);
      const lastOrderAt = orders[0]?.soldAt ?? "";

      return {
        id: phoneKey,
        name: data.name,
        phone: data.phone,
        totalSpent,
        totalProfit,
        orderCount: orders.length,
        lastOrderAt,
        orders,
      };
    }
  );

  // Highest spenders first.
  return customers.sort((a, b) => b.totalSpent - a.totalSpent);
}

export function buildCustomerLookup(
  sales: SaleRecord[]
): Map<string, { name: string; phone: string }> {
  const byOrderId = new Map<string, { name: string; phone: string }>();

  for (const sale of sales) {
    for (const item of sale.items) {
      byOrderId.set(item.orderId, {
        name: sale.customerName,
        phone: sale.customerPhone,
      });
    }
  }

  return byOrderId;
}
