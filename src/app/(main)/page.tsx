import PageHeader from "@/components/PageHeader";
import StatsGrid from "@/components/StatsGrid";
import BooksTable from "@/components/BooksTable";
import { getBooks } from "@/lib/books";
import { calculateBookStats } from "@/lib/utils";
import AddBookButton from "@/components/AddBookButton";
import { Bell } from "lucide-react";

export default async function DashboardPage() {
  const books = await getBooks();
  const stats = calculateBookStats(books);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your bookshop inventory."
      >
        <button className="relative rounded-lg border border-brand-200 p-2 text-brand-600 transition hover:bg-brand-50">
          <Bell className="h-5 w-5" />
          {stats.lowStockCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {stats.lowStockCount}
            </span>
          )}
        </button>
        <AddBookButton />
      </PageHeader>

      <div className="space-y-8 p-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display text-2xl font-bold">
              Your Bookshop at a Glance
            </h2>
            <p className="mt-2 text-brand-100">
              You have{" "}
              <span className="font-semibold text-white">
                {stats.totalBooks} titles
              </span>{" "}
              from{" "}
              <span className="font-semibold text-white">
                {stats.uniqueAuthors} authors
              </span>{" "}
              worth{" "}
              <span className="font-semibold text-white">
                ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>{" "}
              in inventory.
            </p>
          </div>
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -right-4 h-64 w-64 rounded-full bg-white/5" />
        </div>

        {/* Stats Cards */}
        <StatsGrid stats={stats} />

        {/* Books snapshot */}
        <BooksTable
          books={books}
          title="Recent Books"
          pageSize={5}
          viewAllHref="/books"
          showActions={false}
        />
      </div>
    </>
  );
}
