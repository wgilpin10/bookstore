"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";
import {
  formatCurrency,
  formatNumber,
  getBookStockStatus,
} from "@/lib/utils";
import {
  BookFilters,
  countActiveFilters,
  defaultBookFilters,
  hasActiveFilters,
  matchesBookFilters,
} from "@/lib/book-filters";
import BooksFilterPanel from "@/components/BooksFilterPanel";
import BooksExportMenu from "@/components/BooksExportMenu";
import EditBookModal from "@/components/EditBookModal";
import { Search, Filter, Trash2, Pencil, ArrowRight } from "lucide-react";

interface BooksTableProps {
  books: Book[];
  title?: string;
  showActions?: boolean;
  enableFilters?: boolean;
  pageSize?: number;
  enablePageSizeSelector?: boolean;
  viewAllHref?: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, "all"] as const;
type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

function matchesSearch(book: Book, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return (
    book.title.toLowerCase().includes(normalizedQuery) ||
    book.author.toLowerCase().includes(normalizedQuery)
  );
}

async function requestDelete(
  url: string,
  options?: RequestInit
): Promise<{ error?: string }> {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      return {
        error:
          typeof data.error === "string"
            ? data.error
            : "Failed to delete book(s).",
      };
    }

    return {};
  } catch {
    return { error: "Failed to delete book(s). Please try again." };
  }
}

export default function BooksTable({
  books,
  title = "Book Inventory",
  showActions = true,
  enableFilters = false,
  pageSize,
  enablePageSizeSelector = false,
  viewAllHref,
}: BooksTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookFilters>(defaultBookFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedPageSize, setSelectedPageSize] = useState<PageSizeOption>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          matchesSearch(book, searchQuery) &&
          (!enableFilters || matchesBookFilters(book, filters))
      ),
    [books, searchQuery, filters, enableFilters]
  );

  const activePageSize: number | "all" = enablePageSizeSelector
    ? selectedPageSize
    : pageSize ?? "all";

  const isPaginated = activePageSize !== "all";

  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(filteredBooks.length / activePageSize))
    : 1;

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filters, selectedPageSize, books.length]);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const displayedBooks = useMemo(() => {
    if (!isPaginated) return filteredBooks;
    const start = currentPage * activePageSize;
    return filteredBooks.slice(start, start + activePageSize);
  }, [filteredBooks, currentPage, activePageSize, isPaginated]);

  const rangeStart =
    filteredBooks.length === 0
      ? 0
      : isPaginated
        ? currentPage * activePageSize + 1
        : 1;
  const rangeEnd = isPaginated
    ? Math.min((currentPage + 1) * activePageSize, filteredBooks.length)
    : filteredBooks.length;

  const canGoPrevious = isPaginated && currentPage > 0;
  const canGoNext = isPaginated && currentPage < totalPages - 1;
  const hasMoreBooks = isPaginated && filteredBooks.length > activePageSize;

  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = enableFilters && hasActiveFilters(filters);
  const activeFilterCount = countActiveFilters(filters);
  const isViewFiltered = isSearching || isFiltering;
  const allSelected =
    displayedBooks.length > 0 &&
    displayedBooks.every((book) => selectedIds.has(book.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((current) => {
        const next = new Set(current);
        displayedBooks.forEach((book) => next.delete(book.id));
        return next;
      });
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      displayedBooks.forEach((book) => next.add(book.id));
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDeleteBook(book: Book) {
    const confirmed = window.confirm(
      `Delete "${book.title}" by ${book.author}? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingIds((current) => new Set(current).add(book.id));

    const result = await requestDelete(`/api/books/${book.id}`, {
      method: "DELETE",
    });

    setDeletingIds((current) => {
      const next = new Set(current);
      next.delete(book.id);
      return next;
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(book.id);
      return next;
    });
    router.refresh();
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    const confirmed = window.confirm(
      `Delete ${ids.length} selected book${ids.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setBulkDeleting(true);

    const result = await requestDelete("/api/books/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    setBulkDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
      {/* Table Header */}
      <div className="flex flex-col gap-4 border-b border-brand-200/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-950">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-brand-500">
            {filteredBooks.length === 0
              ? "No books to display"
              : isPaginated
                ? `Showing ${rangeStart}-${rangeEnd} of ${filteredBooks.length} books`
                : isViewFiltered
                  ? `${filteredBooks.length} of ${books.length} records shown`
                  : `${books.length} ${books.length === 1 ? "record" : "records"} found`}
            {someSelected && ` · ${selectedIds.size} selected`}
          </p>
        </div>
        {(showActions || viewAllHref) && (
          <div className="flex flex-wrap items-center gap-2">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {showActions && (
              <>
            {someSelected && (
              <button
                type="button"
                onClick={() => void handleBulkDelete()}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {bulkDeleting
                  ? "Deleting..."
                  : `Delete ${selectedIds.size} selected`}
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title or author..."
                aria-label="Search books"
                className="w-full min-w-[12rem] rounded-lg border border-brand-200 bg-brand-50/50 py-2 pl-9 pr-4 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 sm:w-56"
              />
            </div>
            {enableFilters && (
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  isFiltering
                    ? "border-brand-400 bg-brand-100 text-brand-800"
                    : "border-brand-200 text-brand-700 hover:bg-brand-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
            <BooksExportMenu books={filteredBooks} />
              </>
            )}
          </div>
        )}
      </div>

      {enableFilters && filtersOpen && (
        <BooksFilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/80">
              <th className="w-12 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={displayedBooks.length === 0 || bulkDeleting}
                  aria-label="Select all visible books"
                  className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Title
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                Author
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Price
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Cost
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Quantity
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                Value
              </th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-brand-500">
                Status
              </th>
              <th className="w-24 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-brand-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {displayedBooks.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-sm text-brand-500"
                >
                  {isViewFiltered
                    ? "No books match your current search or filters."
                    : "No books found."}
                </td>
              </tr>
            )}
            {displayedBooks.map((book, index) => {
              const stockStatus = getBookStockStatus(book);
              const rowValue = book.price * book.quantity;
              const isSelected = selectedIds.has(book.id);
              const isDeleting = deletingIds.has(book.id);

              return (
                <tr
                  key={book.id}
                  className={`transition-colors hover:bg-brand-50/50 ${
                    index % 2 === 0 ? "bg-white" : "bg-brand-50/30"
                  } ${isSelected ? "bg-brand-100/40" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(book.id)}
                      disabled={bulkDeleting || isDeleting}
                      aria-label={`Select ${book.title}`}
                      className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-brand-900">
                      {book.title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-brand-600">{book.author}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-medium text-brand-900">
                      {formatCurrency(book.price)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm text-brand-600">
                      {book.cost_price != null
                        ? formatCurrency(book.cost_price)
                        : "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p
                      className={`text-sm font-medium ${
                        stockStatus === "Out of Stock"
                          ? "text-red-600"
                          : stockStatus === "Low in Stock"
                            ? "text-amber-600"
                            : "text-brand-900"
                      }`}
                    >
                      {formatNumber(book.quantity)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm text-brand-600">
                      {formatCurrency(rowValue)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {stockStatus === "Out of Stock" ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        Out of Stock
                      </span>
                    ) : stockStatus === "Low in Stock" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Low in Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingBook(book)}
                        disabled={isDeleting || bulkDeleting}
                        aria-label={`Edit ${book.title}`}
                        className="inline-flex rounded-lg p-2 text-brand-400 transition hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteBook(book)}
                        disabled={isDeleting || bulkDeleting}
                        aria-label={`Delete ${book.title}`}
                        className="inline-flex rounded-lg p-2 text-brand-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col gap-4 border-t border-brand-200/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-brand-500">
            {filteredBooks.length === 0
              ? "No books to display"
              : isPaginated
                ? `Showing ${rangeStart}-${rangeEnd} of ${filteredBooks.length} books`
                : isViewFiltered
                  ? `Showing ${filteredBooks.length} of ${books.length} books`
                  : `Showing all ${books.length} books`}
          </p>
          {enablePageSizeSelector && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm text-brand-500"
              >
                Show
              </label>
              <select
                id="page-size"
                value={selectedPageSize}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedPageSize(
                    value === "all"
                      ? "all"
                      : (Number(value) as Exclude<PageSizeOption, "all">)
                  );
                }}
                className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All" : option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && hasMoreBooks && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {isPaginated && (
            <span className="text-sm text-brand-500">
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
          {isPaginated && (
            <>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={!canGoPrevious}
                className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-brand-400"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={!canGoNext}
                className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-brand-400"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
        />
      )}
    </div>
  );
}
