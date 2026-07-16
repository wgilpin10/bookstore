"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";
import { formatCurrency, getBookStockStatus } from "@/lib/utils";
import { Pencil, X } from "lucide-react";

interface EditBookModalProps {
  book: Book;
  onClose: () => void;
}

function StatusBadge({ status }: { status: ReturnType<typeof getBookStockStatus> }) {
  if (status === "Out of Stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Out of Stock
      </span>
    );
  }

  if (status === "Low in Stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Low in Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      In Stock
    </span>
  );
}

export default function EditBookModal({ book, onClose }: EditBookModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [price, setPrice] = useState(String(book.price));
  const [costPrice, setCostPrice] = useState(
    book.cost_price != null ? String(book.cost_price) : ""
  );
  const [quantity, setQuantity] = useState(String(book.quantity));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const parsedCostPrice = costPrice.trim() ? Number(costPrice) : undefined;

    const draftBook: Book = {
      id: book.id,
      title,
      author,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      quantity: Number.isInteger(parsedQuantity) ? parsedQuantity : 0,
      cost_price:
        parsedCostPrice != null && Number.isFinite(parsedCostPrice)
          ? parsedCostPrice
          : undefined,
    };

    return {
      value: draftBook.price * draftBook.quantity,
      status: getBookStockStatus({ ...draftBook, status: undefined }),
    };
  }, [book.id, title, author, price, costPrice, quantity]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
      quantity: Number(quantity),
      cost_price: costPrice.trim() ? Number(costPrice) : undefined,
    };

    if (!payload.title) {
      setError("Title is required.");
      setLoading(false);
      return;
    }
    if (!payload.author) {
      setError("Author is required.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setError("Enter a valid price.");
      setLoading(false);
      return;
    }
    if (!Number.isInteger(payload.quantity) || payload.quantity < 0) {
      setError("Enter a valid quantity.");
      setLoading(false);
      return;
    }
    if (
      payload.cost_price != null &&
      (!Number.isFinite(payload.cost_price) || payload.cost_price < 0)
    ) {
      setError("Enter a valid cost price.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to update book."
        );
        setLoading(false);
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Failed to update book. Please try again.");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit book dialog"
        className="absolute inset-0 bg-brand-950/40"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-brand-200/60 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-950">
              Edit Book
            </h2>
            <p className="mt-1 text-sm text-brand-500">
              Update this title&apos;s details. Value and status update
              automatically.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="mb-1.5 block text-sm font-medium text-brand-700"
            >
              Title
            </label>
            <input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>

          <div>
            <label
              htmlFor="edit-author"
              className="mb-1.5 block text-sm font-medium text-brand-700"
            >
              Author
            </label>
            <input
              id="edit-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
              className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-price"
                className="mb-1.5 block text-sm font-medium text-brand-700"
              >
                Price
              </label>
              <input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
                className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="edit-cost-price"
                className="mb-1.5 block text-sm font-medium text-brand-700"
              >
                Cost Price
              </label>
              <input
                id="edit-cost-price"
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-quantity"
              className="mb-1.5 block text-sm font-medium text-brand-700"
            >
              Quantity
            </label>
            <input
              id="edit-quantity"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>

          <div className="rounded-xl border border-brand-200/60 bg-brand-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
              Preview
            </p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-brand-500">Value</p>
                <p className="text-sm font-semibold text-brand-900">
                  {formatCurrency(preview.value)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-brand-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={preview.status} />
                </div>
              </div>
            </div>
          </div>

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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
