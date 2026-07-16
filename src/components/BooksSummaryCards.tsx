import { Book } from "@/types/book";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import { BookOpen, DollarSign, Package } from "lucide-react";

interface BooksSummaryCardsProps {
  books: Book[];
}

export default function BooksSummaryCards({ books }: BooksSummaryCardsProps) {
  const totalBooks = books.length;
  const totalValue = books.reduce(
    (sum, book) => sum + book.price * book.quantity,
    0
  );
  const totalUnits = books.reduce((sum, book) => sum + book.quantity, 0);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        title="Total Books"
        value={formatNumber(totalBooks)}
        subtitle="Unique titles in your catalog"
        icon={BookOpen}
        accent="default"
      />
      <StatCard
        title="Inventory Value"
        value={formatCurrency(totalValue)}
        subtitle="Total retail value across all books"
        icon={DollarSign}
        accent="success"
      />
      <StatCard
        title="Total Units"
        value={formatNumber(totalUnits)}
        subtitle="Individual copies in stock"
        icon={Package}
        accent="info"
      />
    </div>
  );
}
