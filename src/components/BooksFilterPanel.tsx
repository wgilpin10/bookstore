"use client";

import {
  BookFilters,
  FilterOperator,
  StockStatusFilter,
  defaultBookFilters,
} from "@/lib/book-filters";
import { X } from "lucide-react";

interface BooksFilterPanelProps {
  filters: BookFilters;
  onChange: (filters: BookFilters) => void;
  onClose: () => void;
}

const stockStatusOptions: { value: StockStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "In Stock", label: "In Stock" },
  { value: "Low in Stock", label: "Low in Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

const operatorOptions: { value: FilterOperator; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "above", label: "Above" },
  { value: "below", label: "Below" },
  { value: "equals", label: "Equals" },
];

export default function BooksFilterPanel({
  filters,
  onChange,
  onClose,
}: BooksFilterPanelProps) {
  function updateFilter<K extends keyof BookFilters>(
    key: K,
    value: BookFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="border-b border-brand-200/60 bg-brand-50/40 px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brand-900">Filters</h3>
          <p className="text-xs text-brand-500">
            Narrow the table by stock status, quantity, or price.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="rounded-lg p-1 text-brand-400 transition hover:bg-white hover:text-brand-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <label
            htmlFor="stock-status-filter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-500"
          >
            Stock Status
          </label>
          <select
            id="stock-status-filter"
            value={filters.stockStatus}
            onChange={(event) =>
              updateFilter(
                "stockStatus",
                event.target.value as StockStatusFilter
              )
            }
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          >
            {stockStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-500">
            Quantity
          </label>
          <div className="flex gap-2">
            <select
              value={filters.quantityOperator}
              onChange={(event) =>
                updateFilter(
                  "quantityOperator",
                  event.target.value as FilterOperator
                )
              }
              className="w-28 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            >
              {operatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="1"
              value={filters.quantityValue}
              onChange={(event) =>
                updateFilter("quantityValue", event.target.value)
              }
              disabled={filters.quantityOperator === "any"}
              placeholder="Amount"
              className="min-w-0 flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:bg-brand-100/60 disabled:text-brand-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-500">
            Price
          </label>
          <div className="flex gap-2">
            <select
              value={filters.priceOperator}
              onChange={(event) =>
                updateFilter(
                  "priceOperator",
                  event.target.value as FilterOperator
                )
              }
              className="w-28 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            >
              {operatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.priceValue}
              onChange={(event) => updateFilter("priceValue", event.target.value)}
              disabled={filters.priceOperator === "any"}
              placeholder="Amount"
              className="min-w-0 flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:bg-brand-100/60 disabled:text-brand-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onChange(defaultBookFilters)}
          className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
