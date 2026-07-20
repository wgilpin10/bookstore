import PageHeader from "@/components/PageHeader";
import CustomersView from "@/components/CustomersView";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customers are identified by phone number. Rank the top 10 by profit or separate sales."
      />
      <div className="p-8">
        <CustomersView customers={customers} />
      </div>
    </>
  );
}
