import { getBooks } from "@/lib/books";
import {
  applySaleToCustomerInApi,
  ensureCustomerInApi,
} from "@/lib/customers-api";
import { buildCustomerLookup } from "@/lib/customers";
import { createOrderInApi, fetchOrdersFromApi } from "@/lib/orders-api";
import { appendSale, readSales } from "@/lib/sales-store";
import { SaleLineRecord, SaleRecord } from "@/types/customer";
import {
  CreateOrderInput,
  CreateSaleInput,
  Order,
} from "@/types/order";

export async function getOrders(): Promise<Order[]> {
  const [orders, sales] = await Promise.all([
    fetchOrdersFromApi(),
    readSales(),
  ]);

  const lookup = buildCustomerLookup(sales);

  return orders.map((order) => {
    const customer = lookup.get(order.id);
    if (!customer) return order;
    return {
      ...order,
      customerName: order.customerName || customer.name,
      customerPhone: order.customerPhone || customer.phone,
    };
  });
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return createOrderInApi(input);
}

export async function createSale(input: CreateSaleInput): Promise<{
  sale: SaleRecord;
  orders: Order[];
}> {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();

  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  if (!customerPhone) {
    throw new Error("Customer phone number is required.");
  }

  if (!/^\d+$/.test(customerPhone)) {
    throw new Error("Phone number must contain only digits.");
  }

  if (!input.items.length) {
    throw new Error("Add at least one book to the sale.");
  }

  const books = await getBooks();
  const sellable = new Map(books.map((book) => [book.id, book]));
  const requestedByBook = new Map<string, number>();

  for (const item of input.items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Each book must have a quantity of at least 1.");
    }

    const book = sellable.get(String(item.bookId));
    if (!book) {
      throw new Error("One of the selected books was not found.");
    }

    if (book.quantity === 0) {
      throw new Error(`"${book.title}" is out of stock and cannot be sold.`);
    }

    const totalForBook = (requestedByBook.get(book.id) ?? 0) + quantity;
    if (totalForBook > book.quantity) {
      throw new Error(
        `Only ${book.quantity} unit${book.quantity === 1 ? "" : "s"} of "${book.title}" available.`
      );
    }

    requestedByBook.set(book.id, totalForBook);
  }

  const customer = await ensureCustomerInApi({
    name: customerName,
    phone: customerPhone,
  });

  const createdOrders: Order[] = [];
  const saleItems: SaleLineRecord[] = [];

  for (const item of input.items) {
    const book = sellable.get(String(item.bookId));
    if (!book) continue;

    const order = await createOrderInApi({
      bookId: book.id,
      quantity: Number(item.quantity),
      soldAt: input.soldAt,
      customerId: customer.id,
      customerName: customer.name || customerName,
      customerPhone: customer.phone || customerPhone,
    });

    createdOrders.push(order);
    saleItems.push({
      orderId: order.id,
      bookId: book.id,
      bookTitle: order.bookTitle || book.title,
      author: order.author || book.author,
      quantity: order.quantity || Number(item.quantity),
      unitPrice: order.unitPrice || book.price,
      revenue: order.revenue,
      profit: order.profit,
    });

    // Keep local availability in sync for multi-line validation within this sale.
    sellable.set(book.id, {
      ...book,
      quantity: book.quantity - Number(item.quantity),
    });
  }

  const soldAt =
    createdOrders.find((order) => order.soldAt)?.soldAt ||
    input.soldAt ||
    new Date().toISOString();

  const totalRevenue = saleItems.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = saleItems.reduce((sum, item) => sum + item.profit, 0);

  await applySaleToCustomerInApi({
    customer,
    saleCount: 1,
    revenue: totalRevenue,
    profit: totalProfit,
    soldAt,
  });

  const sale: SaleRecord = {
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    customerId: customer.id,
    customerName: customer.name || customerName,
    customerPhone: customer.phone || customerPhone,
    soldAt,
    totalRevenue,
    totalProfit,
    items: saleItems,
    createdAt: new Date().toISOString(),
  };

  await appendSale(sale);

  return { sale, orders: createdOrders };
}
