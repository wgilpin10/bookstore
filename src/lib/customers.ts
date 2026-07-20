import {
  dedupeCustomersByPhone,
  normalizePhone,
} from "@/lib/customer-utils";
import { fetchCustomersFromApi } from "@/lib/customers-api";
import { readSales } from "@/lib/sales-store";
import {
  Customer,
  CustomerSaleGroup,
  SaleRecord,
} from "@/types/customer";

/** Group recorded sales by normalized phone number. */
function salesByPhone(
  sales: SaleRecord[]
): Map<string, CustomerSaleGroup[]> {
  const byPhone = new Map<string, CustomerSaleGroup[]>();

  for (const sale of sales) {
    const phoneKey = normalizePhone(sale.customerPhone);
    if (!phoneKey) continue;

    const group: CustomerSaleGroup = {
      saleId: sale.id,
      soldAt: sale.soldAt,
      totalRevenue: sale.totalRevenue,
      totalProfit: sale.totalProfit,
      items: sale.items.map((item) => ({
        orderId: item.orderId,
        bookTitle: item.bookTitle,
        quantity: item.quantity,
        revenue: item.revenue,
        profit: item.profit,
        soldAt: sale.soldAt,
      })),
    };

    const list = byPhone.get(phoneKey) ?? [];
    if (!list.some((existing) => existing.saleId === group.saleId)) {
      list.push(group);
    }
    byPhone.set(phoneKey, list);
  }

  for (const list of byPhone.values()) {
    list.sort((a, b) => {
      const aTime = new Date(a.soldAt).getTime();
      const bTime = new Date(b.soldAt).getTime();
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
  }

  return byPhone;
}

/**
 * One customer per phone number from the database.
 * Separate sales for that phone are attached for the dropdown.
 */
export async function getCustomers(): Promise<Customer[]> {
  const [apiCustomers, sales] = await Promise.all([
    fetchCustomersFromApi(),
    readSales(),
  ]);

  const customers = dedupeCustomersByPhone(apiCustomers);
  const history = salesByPhone(sales);

  return customers.map((customer) => {
    const phoneKey = normalizePhone(customer.phone);
    const saleGroups = history.get(phoneKey) ?? [];

    return {
      ...customer,
      // Database `sales` count is the source of truth; local history is for the dropdown.
      sales: saleGroups,
    };
  });
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
