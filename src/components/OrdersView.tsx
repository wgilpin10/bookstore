"use client";

import { useMemo, useState } from "react";
import { Order } from "@/types/order";
import { Book } from "@/types/book";
import {
  calculateOrderStats,
  filterOrdersByMonth,
  formatMonthLabel,
  formatSoldAt,
  getAvailableMonths,
  getCurrentMonthKey,
} from "@/lib/order-utils";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import RecordSaleButton from "@/components/RecordSaleButton";
import PageHeader from "@/components/PageHeader";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

interface OrdersViewProps {
  orders: Order[];
  books: Book[];
}

export default function OrdersView({ orders, books }: OrdersViewProps) {
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const availableMonths = useMemo(() => getAvailableMonths(orders), [orders]);
  const currentMonthKey = getCurrentMonthKey();

  const filteredOrders = useMemo(
    () => filterOrdersByMonth(orders, monthFilter),
    [orders, monthFilter]
  );

  const stats = useMemo(
    () => calculateOrderStats(orders, filteredOrders),
    [orders, filteredOrders]
  );

  const filterLabel =
    monthFilter === "all"
      ? "all months"
      : monthFilter === "current"
        ? formatMonthLabel(currentMonthKey)
        : formatMonthLabel(monthFilter);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track sales, profit, and inventory deductions."
      >
        <RecordSaleButton books={books} />
      </PageHeader>

      <div className="space-y-8 p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Profit"
            value={formatCurrency(stats.profit)}
            subtitle={`From orders in ${filterLabel}`}
            icon={TrendingUp}
            accent="success"
          />
          <StatCard
            title="Orders This Month"
            value={formatNumber(stats.currentMonthOrderCount)}
            subtitle={formatMonthLabel(currentMonthKey)}
            icon={ShoppingBag}
            accent="info"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.revenue)}
            subtitle={`${stats.orderCount} order${stats.orderCount === 1 ? "" : "s"} shown`}
            icon={DollarSign}
            accent="default"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-brand-200/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-950">
                Sales History
              </h2>
              <p className="mt-0.5 text-sm text-brand-500">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"} shown
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="month-filter" className="text-sm text-brand-500">
                Month
              </label>
              <select
                id="month-filter"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              >
                <option value="all">All months</option>
                <option value="current">
                  Current month ({formatMonthLabel(currentMonthKey)})
                </option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50/80">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Date & Time
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Customer
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Book
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Author
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Qty
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Unit Price
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Revenue
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-brand-500"
                    >
                      No orders for this period. Record a sale to get started.
                    </td>
                  </tr>
                )}
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`transition-colors hover:bg-brand-50/50 ${
                      index % 2 === 0 ? "bg-white" : "bg-brand-50/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-brand-900">
                        {formatSoldAt(order.soldAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {order.customerName || order.customerPhone ? (
                        <div>
                          <p className="text-sm font-semibold text-brand-900">
                            {order.customerName || "—"}
                          </p>
                          <p className="text-xs text-brand-500">
                            {order.customerPhone || "—"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-brand-400">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-brand-900">
                        {order.bookTitle}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-brand-600">{order.author}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-brand-900">
                        {order.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm text-brand-600">
                        {formatCurrency(order.unitPrice)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-brand-900">
                        {formatCurrency(order.revenue)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(order.profit)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
