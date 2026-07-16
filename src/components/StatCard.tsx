import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accent?: "default" | "warning" | "success" | "info";
}

const accentStyles = {
  default: {
    icon: "bg-brand-100 text-brand-600",
    ring: "hover:ring-brand-200",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    ring: "hover:ring-amber-200",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-600",
    ring: "hover:ring-emerald-200",
  },
  info: {
    icon: "bg-sky-100 text-sky-600",
    ring: "hover:ring-sky-200",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "default",
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-brand-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:ring-2 ${styles.ring}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-500">{title}</p>
          <p className="font-display text-3xl font-bold tracking-tight text-brand-950">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-brand-400">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                trend.positive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-brand-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
