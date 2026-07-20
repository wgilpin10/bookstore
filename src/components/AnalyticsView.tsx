"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildCustomersOverTime,
  buildProfitOverPastYear,
  buildTopBooksSold,
} from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Customer } from "@/types/customer";
import { Order } from "@/types/order";

interface AnalyticsViewProps {
  orders: Order[];
  customers: Customer[];
}

const PROFIT_COLOR = "#c66d3f";
const CUSTOMERS_COLOR = "#a55535";
const BOOKS_COLOR = "#d4834a";

function shortMonthLabel(fullLabel: string): string {
  const [month, year] = fullLabel.split(" ");
  if (!month || !year) return fullLabel;
  return `${month.slice(0, 3)} '${year.slice(-2)}`;
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
      <div className="border-b border-brand-200/60 px-6 py-5">
        <h2 className="font-display text-xl font-bold text-brand-950">{title}</h2>
        <p className="mt-0.5 text-sm text-brand-500">{description}</p>
      </div>
      <div className="px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl bg-brand-50/60 text-sm text-brand-500">
      {message}
    </div>
  );
}

export default function AnalyticsView({
  orders,
  customers,
}: AnalyticsViewProps) {
  const profitSeries = useMemo(
    () =>
      buildProfitOverPastYear(orders).map((point) => ({
        ...point,
        shortLabel: shortMonthLabel(point.label),
      })),
    [orders]
  );

  const customersSeries = useMemo(
    () =>
      buildCustomersOverTime(customers).map((point) => ({
        ...point,
        shortLabel: shortMonthLabel(point.label),
      })),
    [customers]
  );

  const topBooks = useMemo(() => buildTopBooksSold(orders, 10), [orders]);

  const hasProfit = profitSeries.some((point) => point.value !== 0);
  const hasCustomers = customersSeries.some((point) => point.value > 0);
  const hasBooks = topBooks.length > 0;

  return (
    <div className="space-y-8">
      <ChartCard
        title="Profit over the past year"
        description="Monthly profit from recorded orders. Updates automatically when new sales are added."
      >
        {!hasProfit ? (
          <EmptyChart message="No profit data in the past year yet." />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={profitSeries}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PROFIT_COLOR} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={PROFIT_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f2d9bd" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: "#a55535", fontSize: 12 }}
                  axisLine={{ stroke: "#e8bf94" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#a55535", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickFormatter={(value: number) =>
                    value >= 1000
                      ? `$${(value / 1000).toFixed(1)}k`
                      : `$${value}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#f2d9bd",
                    boxShadow: "0 8px 24px rgba(58, 28, 20, 0.08)",
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ""
                  }
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Profit",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={PROFIT_COLOR}
                  strokeWidth={2.5}
                  fill="url(#profitFill)"
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Customers over time"
        description="Cumulative customers by first known order date over the past year."
      >
        {!hasCustomers ? (
          <EmptyChart message="No customer timeline data yet." />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={customersSeries}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="customersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={CUSTOMERS_COLOR}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={CUSTOMERS_COLOR}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f2d9bd" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: "#a55535", fontSize: 12 }}
                  axisLine={{ stroke: "#e8bf94" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#a55535", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#f2d9bd",
                    boxShadow: "0 8px 24px rgba(58, 28, 20, 0.08)",
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ""
                  }
                  formatter={(value) => [
                    formatNumber(Number(value ?? 0)),
                    "Customers",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CUSTOMERS_COLOR}
                  strokeWidth={2.5}
                  fill="url(#customersFill)"
                  name="Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Top 10 books sold"
        description="All-time units sold by title. Updates automatically with new orders."
      >
        {!hasBooks ? (
          <EmptyChart message="No book sales to chart yet." />
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBooks}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="#f2d9bd" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#a55535", fontSize: 12 }}
                  axisLine={{ stroke: "#e8bf94" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="book"
                  width={140}
                  tick={{ fill: "#6c3a2b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#f2d9bd",
                    boxShadow: "0 8px 24px rgba(58, 28, 20, 0.08)",
                  }}
                  formatter={(value) => [
                    `${formatNumber(Number(value ?? 0))} sold`,
                    "Quantity",
                  ]}
                />
                <Bar
                  dataKey="quantity"
                  fill={BOOKS_COLOR}
                  radius={[0, 8, 8, 0]}
                  name="Quantity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
