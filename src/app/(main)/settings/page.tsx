import PageHeader from "@/components/PageHeader";
import ProfileSettingsView from "@/components/ProfileSettingsView";
import { getSessionUser } from "@/lib/auth";
import { getManagedUserById } from "@/lib/users-api";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const profile = await getManagedUserById(sessionUser.id);
  const user = {
    ...sessionUser,
    email: profile?.email ?? sessionUser.email,
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account, password, and security."
      />
      <div className="p-8">
        <ProfileSettingsView currentUser={user} />
      </div>
    </>
  );
}
