import Sidebar from "./Sidebar";
import { AuthUser } from "@/types/user";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser;
}) {
  return (
    <div className="min-h-screen bg-brand-50/50">
      <Sidebar user={user} />
      <main className="pl-64">{children}</main>
    </div>
  );
}
