import PageHeader from "@/components/PageHeader";
import AnalyticsView from "@/components/AnalyticsView";
import { getCustomers } from "@/lib/customers";
import { getOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [orders, customers] = await Promise.all([
    getOrders(),
    getCustomers(),
  ]);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Live charts from your orders and customers. Refresh the page after new sales to see updates."
      />
      <div className="p-8">
        <AnalyticsView orders={orders} customers={customers} />
      </div>
    </>
  );
}
