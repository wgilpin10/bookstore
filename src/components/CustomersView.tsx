"use client";

import { useState } from "react";
import { Customer } from "@/types/customer";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { formatSoldAt } from "@/lib/order-utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CustomersViewProps {
  customers: Customer[];
}

export default function CustomersView({ customers }: CustomersViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    customers[0]?.id ?? null
  );

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-200/60 bg-white px-6 py-16 text-center shadow-sm">
        <h2 className="font-display text-xl font-bold text-brand-950">
          No customers yet
        </h2>
        <p className="mt-2 text-sm text-brand-500">
          Record a sale with a customer name and phone number to start building
          your customer list.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
      <div className="border-b border-brand-200/60 px-6 py-5">
        <h2 className="font-display text-xl font-bold text-brand-950">
          Top Spenders
        </h2>
        <p className="mt-0.5 text-sm text-brand-500">
          Sorted by total order value (highest first)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/80">
              <th className="w-10 px-4 py-3.5" />
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Rank
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Phone
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Orders
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Total Spent
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Profit
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {customers.map((customer, index) => {
              const isExpanded = expandedId === customer.id;

              return (
                <CustomerRows
                  key={customer.id}
                  customer={customer}
                  rank={index + 1}
                  isExpanded={isExpanded}
                  onToggle={() =>
                    setExpandedId(isExpanded ? null : customer.id)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerRows({
  customer,
  rank,
  isExpanded,
  onToggle,
}: {
  customer: Customer;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="transition-colors hover:bg-brand-50/50">
        <td className="px-4 py-4">
          <button
            type="button"
            onClick={onToggle}
            aria-label={
              isExpanded
                ? `Collapse orders for ${customer.name}`
                : `Expand orders for ${customer.name}`
            }
            className="rounded-lg p-1 text-brand-400 transition hover:bg-brand-100 hover:text-brand-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {rank}
          </span>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-brand-900">{customer.name}</p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-brand-600">{customer.phone}</p>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="text-sm font-medium text-brand-900">
            {formatNumber(customer.orderCount)}
          </p>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="text-sm font-semibold text-brand-900">
            {formatCurrency(customer.totalSpent)}
          </p>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="text-sm font-semibold text-emerald-700">
            {formatCurrency(customer.totalProfit)}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm text-brand-600">
            {formatSoldAt(customer.lastOrderAt)}
          </p>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-brand-50/40">
          <td colSpan={8} className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
              Order history
            </p>
            <div className="overflow-hidden rounded-xl border border-brand-200/60 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-100 bg-brand-50/80">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Date & Time
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Book
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Revenue
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {customer.orders.map((order) => (
                    <tr key={`${order.orderId}-${order.bookTitle}`}>
                      <td className="px-4 py-2.5 text-sm text-brand-700">
                        {formatSoldAt(order.soldAt)}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-brand-900">
                        {order.bookTitle}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-brand-700">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-brand-700">
                        {formatCurrency(order.revenue)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-medium text-emerald-700">
                        {formatCurrency(order.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
