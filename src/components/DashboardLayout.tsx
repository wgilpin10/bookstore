import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-50/50">
      <Sidebar />
      <main className="pl-64">{children}</main>
    </div>
  );
}
