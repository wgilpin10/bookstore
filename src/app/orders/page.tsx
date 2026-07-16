import { getBooks } from "@/lib/books";
import { getOrders } from "@/lib/orders";
import OrdersView from "@/components/OrdersView";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, books] = await Promise.all([getOrders(), getBooks()]);

  return <OrdersView orders={orders} books={books} />;
}
