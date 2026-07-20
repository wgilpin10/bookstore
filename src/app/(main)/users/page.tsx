import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import UserManagementView from "@/components/UserManagementView";
import { getSessionUser } from "@/lib/auth";
import { listManagedUsers } from "@/lib/users-api";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect("/login");
  if (!currentUser.isSuperAdmin) redirect("/settings");

  const users = await listManagedUsers();

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage user access and administrator permissions."
      />
      <div className="p-8">
        <UserManagementView
          currentUser={currentUser}
          initialUsers={users}
        />
      </div>
    </>
  );
}
