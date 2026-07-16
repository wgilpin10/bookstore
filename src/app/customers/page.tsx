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
        description="See who is buying and who spends the most."
      />
      <div className="p-8">
        <CustomersView customers={customers} />
      </div>
    </>
  );
}
