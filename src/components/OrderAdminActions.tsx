"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";

interface OrderAdminActionsProps {
  order: Order;
}

export default function OrderAdminActions({
  order,
}: OrderAdminActionsProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  async function cancelOrder() {
    if (
      !window.confirm(
        `Cancel order #${order.id} for “${order.bookTitle}”? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to cancel order."
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to cancel order.");
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative inline-flex justify-end">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          disabled={busy}
          aria-label={`Actions for order ${order.id}`}
          className="rounded-lg p-2 text-brand-500 transition hover:bg-brand-100 hover:text-brand-800 disabled:opacity-50"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-brand-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setEditing(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-700 hover:bg-brand-50"
            >
              <Pencil className="h-4 w-4" />
              Edit order
            </button>
            <button
              type="button"
              onClick={cancelOrder}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Cancel / refund
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-right text-xs text-red-600">{error}</p>
      )}

      {editing && (
        <EditOrderModal
          order={order}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function EditOrderModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: () => void;
}) {
  const unitCost =
    order.quantity > 0
      ? order.unitPrice - order.profit / order.quantity
      : 0;
  const [bookTitle, setBookTitle] = useState(order.bookTitle);
  const [author, setAuthor] = useState(order.author);
  const [quantity, setQuantity] = useState(String(order.quantity));
  const [unitPrice, setUnitPrice] = useState(String(order.unitPrice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qty = Number(quantity);
  const price = Number(unitPrice);
  const previewRevenue =
    Number.isFinite(qty) && Number.isFinite(price)
      ? Number((qty * price).toFixed(2))
      : 0;
  const previewProfit =
    Number.isFinite(qty) && Number.isFinite(price)
      ? Number(((price - unitCost) * qty).toFixed(2))
      : 0;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle,
          author,
          quantity: qty,
          unitPrice: price,
          revenue: previewRevenue,
          profit: previewProfit,
          soldAt: order.soldAt,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to update order."
        );
        return;
      }
      onSaved();
    } catch {
      setError("Failed to update order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <h3 className="font-display text-lg font-bold text-brand-950">
            Edit order #{order.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">
              Book
            </label>
            <input
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
              required
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-700">
              Author
            </label>
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-700">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-700">
                Unit price
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                required
                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              />
            </div>
          </div>

          <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Revenue:{" "}
            <span className="font-semibold">
              {formatCurrency(previewRevenue)}
            </span>
            <span className="mx-2 text-brand-300">·</span>
            Profit:{" "}
            <span className="font-semibold text-emerald-700">
              {formatCurrency(previewProfit)}
            </span>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
