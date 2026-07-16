import { BookStats } from "@/types/book";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "./StatCard";
import {
  BookOpen,
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface StatsGridProps {
  stats: BookStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total Titles"
        value={formatNumber(stats.totalBooks)}
        subtitle="Unique book titles in catalog"
        icon={BookOpen}
        accent="default"
      />
      <StatCard
        title="Total Inventory"
        value={formatNumber(stats.totalInventory)}
        subtitle="Units across all titles"
        icon={Package}
        accent="info"
      />
      <StatCard
        title="Inventory Value"
        value={formatCurrency(stats.totalValue)}
        subtitle="Total retail value in stock"
        icon={DollarSign}
        accent="success"
        trend={{ value: "12% from last month", positive: true }}
      />
      <StatCard
        title="Unique Authors"
        value={formatNumber(stats.uniqueAuthors)}
        subtitle="Authors in your catalog"
        icon={Users}
        accent="default"
      />
      <StatCard
        title="Low Stock Alerts"
        value={formatNumber(stats.lowStockCount)}
        subtitle="Titles with fewer than 10 units"
        icon={AlertTriangle}
        accent={stats.lowStockCount > 0 ? "warning" : "success"}
      />
      <StatCard
        title="Average Price"
        value={formatCurrency(stats.averagePrice)}
        subtitle="Mean price per title"
        icon={TrendingUp}
        accent="info"
      />
    </div>
  );
}
