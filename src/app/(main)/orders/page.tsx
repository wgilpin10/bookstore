import { getBooks } from "@/lib/books";
import { getOrders } from "@/lib/orders";
import { getSessionUser } from "@/lib/auth";
import OrdersView from "@/components/OrdersView";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, books, user] = await Promise.all([
    getOrders(),
    getBooks(),
    getSessionUser(),
  ]);

  return (
    <OrdersView
      orders={orders}
      books={books}
      isSuperAdmin={Boolean(user?.isSuperAdmin)}
    />
  );
}
