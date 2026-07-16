"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";

interface RecordSaleButtonProps {
  books: Book[];
}

interface SaleLine {
  key: string;
  bookId: string;
  quantity: string;
}

function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function newLine(bookId = ""): SaleLine {
  return {
    key: `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    bookId,
    quantity: "1",
  };
}

export default function RecordSaleButton({ books }: RecordSaleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [soldAt, setSoldAt] = useState(() => toDateTimeLocalValue(new Date()));
  const [lines, setLines] = useState<SaleLine[]>([newLine()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellableBooks = useMemo(
    () => books.filter((book) => book.quantity > 0),
    [books]
  );

  const preview = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    let valid = true;

    for (const line of lines) {
      const book = sellableBooks.find((item) => item.id === line.bookId);
      const qty = Number(line.quantity);
      if (!book || !Number.isInteger(qty) || qty <= 0) {
        valid = false;
        continue;
      }
      const unitCost = book.cost_price ?? 0;
      revenue += book.price * qty;
      profit += (book.price - unitCost) * qty;
    }

    return { revenue, profit, valid: valid && lines.length > 0 };
  }, [lines, sellableBooks]);

  function handleOpen() {
    setOpen(true);
    setError(null);
    setCustomerName("");
    setCustomerPhone("");
    setSoldAt(toDateTimeLocalValue(new Date()));
    setLines([newLine(sellableBooks[0]?.id ?? "")]);
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  function updateLine(key: string, patch: Partial<SaleLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function removeLine(key: string) {
    setLines((current) =>
      current.length <= 1 ? current : current.filter((line) => line.key !== key)
    );
  }

  function addLine() {
    const used = new Set(lines.map((line) => line.bookId));
    const nextBook =
      sellableBooks.find((book) => !used.has(book.id)) ?? sellableBooks[0];
    setLines((current) => [...current, newLine(nextBook?.id ?? "")]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!customerName.trim()) {
      setError("Customer name is required.");
      setLoading(false);
      return;
    }

    if (!customerPhone.trim()) {
      setError("Customer phone number is required.");
      setLoading(false);
      return;
    }

    if (!soldAt.trim()) {
      setError("Enter a valid sale date and time.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          soldAt,
          items: lines.map((line) => ({
            bookId: line.bookId,
            quantity: Number(line.quantity),
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to record sale."
        );
        setLoading(false);
        return;
      }

      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Failed to record sale. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={sellableBooks.length === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Record Sale
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close record sale dialog"
            className="absolute inset-0 bg-brand-950/40"
            onClick={handleClose}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-brand-200/60 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-950">
                  Record Sale
                </h2>
                <p className="mt-1 text-sm text-brand-500">
                  Add a customer and sell one or more books in a single order.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {sellableBooks.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                No books are currently in stock.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sale-customer-name"
                      className="mb-1.5 block text-sm font-medium text-brand-700"
                    >
                      Customer name
                    </label>
                    <input
                      id="sale-customer-name"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      required
                      placeholder="Full name"
                      className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sale-customer-phone"
                      className="mb-1.5 block text-sm font-medium text-brand-700"
                    >
                      Phone number
                    </label>
                    <input
                      id="sale-customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      required
                      placeholder="e.g. 555-0100"
                      className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sale-sold-at"
                    className="mb-1.5 block text-sm font-medium text-brand-700"
                  >
                    Sale date & time
                  </label>
                  <input
                    id="sale-sold-at"
                    type="datetime-local"
                    value={soldAt}
                    onChange={(event) => setSoldAt(event.target.value)}
                    required
                    className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-700">Books</p>
                    <button
                      type="button"
                      onClick={addLine}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add book
                    </button>
                  </div>

                  {lines.map((line, index) => {
                    const selectedBook = sellableBooks.find(
                      (book) => book.id === line.bookId
                    );

                    return (
                      <div
                        key={line.key}
                        className="rounded-xl border border-brand-200/70 bg-brand-50/40 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                            Item {index + 1}
                          </p>
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(line.key)}
                              aria-label={`Remove item ${index + 1}`}
                              className="rounded-lg p-1 text-brand-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem]">
                          <select
                            value={line.bookId}
                            onChange={(event) =>
                              updateLine(line.key, {
                                bookId: event.target.value,
                              })
                            }
                            required
                            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                          >
                            {sellableBooks.map((book) => (
                              <option key={book.id} value={book.id}>
                                {book.title} — {book.quantity} in stock
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            max={selectedBook?.quantity ?? 1}
                            step="1"
                            value={line.quantity}
                            onChange={(event) =>
                              updateLine(line.key, {
                                quantity: event.target.value,
                              })
                            }
                            required
                            aria-label={`Quantity for item ${index + 1}`}
                            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {preview.valid && (
                  <div className="rounded-xl border border-brand-200/60 bg-brand-50/50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                      Sale Preview
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-brand-500">Revenue</p>
                        <p className="text-sm font-semibold text-brand-900">
                          {formatCurrency(preview.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-brand-500">Profit</p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {formatCurrency(preview.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {loading ? "Recording..." : "Confirm Sale"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
