"use client";

import { useMemo, useState } from "react";
import { Customer, CustomerSaleGroup } from "@/types/customer";
import {
  CustomerRankBy,
  rankCustomers,
} from "@/lib/customer-utils";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { formatSoldAt } from "@/lib/order-utils";
import { ChevronDown, ChevronRight } from "lucide-react";

const TOP_N = 10;

interface CustomersViewProps {
  customers: Customer[];
}

export default function CustomersView({ customers }: CustomersViewProps) {
  const [rankBy, setRankBy] = useState<CustomerRankBy>("profit");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const rankedTop = useMemo(() => {
    return rankCustomers(customers, rankBy).slice(0, TOP_N);
  }, [customers, rankBy]);

  function toggleExpanded(customerId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-200/60 bg-white px-6 py-16 text-center shadow-sm">
        <h2 className="font-display text-xl font-bold text-brand-950">
          No customers yet
        </h2>
        <p className="mt-2 text-sm text-brand-500">
          Record a sale with a customer name and phone number to start building
          your customer list. The phone number identifies each customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-brand-200/60 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-950">
            Top 10 Customers
          </h2>
          <p className="mt-0.5 text-sm text-brand-500">
            Identified by phone number · ranked by{" "}
            {rankBy === "profit" ? "profit" : "separate sales"}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            Rank by
          </span>
          <select
            value={rankBy}
            onChange={(event) =>
              setRankBy(event.target.value as CustomerRankBy)
            }
            className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          >
            <option value="profit">Profit</option>
            <option value="sales">Separate sales</option>
          </select>
        </label>
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
                Sales
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
            {rankedTop.map((customer) => {
              const isExpanded = expandedIds.has(customer.id);
              const hasSales = customer.sales.length > 0;

              return (
                <CustomerRows
                  key={customer.phone || customer.id}
                  customer={customer}
                  rank={customer.rank ?? 0}
                  isExpanded={isExpanded}
                  hasSales={hasSales}
                  onToggle={() => {
                    if (!hasSales) return;
                    toggleExpanded(customer.id);
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {customers.length > TOP_N && (
        <p className="border-t border-brand-100 px-6 py-3 text-xs text-brand-500">
          Showing top {TOP_N} of {customers.length} customers by{" "}
          {rankBy === "profit" ? "profit" : "separate sales"}.
        </p>
      )}
    </div>
  );
}

function CustomerRows({
  customer,
  rank,
  isExpanded,
  hasSales,
  onToggle,
}: {
  customer: Customer;
  rank: number;
  isExpanded: boolean;
  hasSales: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="transition-colors hover:bg-brand-50/50">
        <td className="px-4 py-4">
          {hasSales ? (
            <button
              type="button"
              onClick={onToggle}
              aria-label={
                isExpanded
                  ? `Collapse sales for ${customer.name}`
                  : `Expand sales for ${customer.name}`
              }
              className="rounded-lg p-1 text-brand-400 transition hover:bg-brand-100 hover:text-brand-700"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="block w-6" aria-hidden />
          )}
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

      {isExpanded && hasSales && (
        <tr className="bg-brand-50/40">
          <td colSpan={8} className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
              Separate sales
            </p>
            <div className="space-y-3">
              {customer.sales.map((sale, index) => (
                <SaleDropdown
                  key={sale.saleId}
                  sale={sale}
                  label={`Sale ${customer.sales.length - index}`}
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SaleDropdown({
  sale,
  label,
}: {
  sale: CustomerSaleGroup;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const bookCount = sale.items.length;

  return (
    <div className="overflow-hidden rounded-xl border border-brand-200/60 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-brand-50/70"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-900">
            {label} · {formatSoldAt(sale.soldAt)}
          </p>
          <p className="mt-0.5 text-xs text-brand-500">
            {bookCount} book{bookCount === 1 ? "" : "s"} · Revenue{" "}
            {formatCurrency(sale.totalRevenue)} · Profit{" "}
            {formatCurrency(sale.totalProfit)}
          </p>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-brand-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-brand-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-brand-100">
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
              {sale.items.map((item) => (
                <tr key={`${sale.saleId}-${item.orderId}-${item.bookTitle}`}>
                  <td className="px-4 py-2.5 text-sm text-brand-700">
                    {formatSoldAt(item.soldAt)}
                  </td>
                  <td className="px-4 py-2.5 text-sm font-medium text-brand-900">
                    {item.bookTitle}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-brand-700">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-brand-700">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium text-emerald-700">
                    {formatCurrency(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
