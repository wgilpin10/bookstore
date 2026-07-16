"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { addBookAction } from "@/app/actions/books";

export default function AddBookButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(form);
      const result = await addBookAction(formData);

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Failed to add book. Please try again.");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        Add Book
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add book dialog"
            className="absolute inset-0 bg-brand-950/40"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-brand-200/60 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-950">
                  Add Book
                </h2>
                <p className="mt-1 text-sm text-brand-500">
                  Add a new title to your inventory.
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
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-brand-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                />
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-1.5 block text-sm font-medium text-brand-700"
                >
                  Author
                </label>
                <input
                  id="author"
                  name="author"
                  required
                  className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-1.5 block text-sm font-medium text-brand-700"
                  >
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cost_price"
                    className="mb-1.5 block text-sm font-medium text-brand-700"
                  >
                    Cost Price
                  </label>
                  <input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="mb-1.5 block text-sm font-medium text-brand-700"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                />
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
                  {loading ? "Adding..." : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
