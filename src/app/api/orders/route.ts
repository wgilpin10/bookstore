import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSale, getOrders } from "@/lib/orders";
import type { CreateSaleInput, SaleLineInput } from "@/types/order";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: {
    customerName?: unknown;
    customerPhone?: unknown;
    soldAt?: unknown;
    items?: unknown;
    // Legacy single-item fields
    bookId?: unknown;
    quantity?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const soldAt =
    typeof body.soldAt === "string" && body.soldAt.trim()
      ? body.soldAt.trim()
      : undefined;

  let items: SaleLineInput[] = [];

  if (Array.isArray(body.items)) {
    items = body.items
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as { bookId?: unknown; quantity?: unknown };
        const bookId = String(row.bookId ?? "").trim();
        const quantity = Number(row.quantity);
        if (!bookId) return null;
        return { bookId, quantity };
      })
      .filter((item): item is SaleLineInput => item != null);
  } else if (body.bookId != null) {
    items = [
      {
        bookId: String(body.bookId).trim(),
        quantity: Number(body.quantity),
      },
    ];
  }

  const input: CreateSaleInput = {
    customerName,
    customerPhone,
    soldAt,
    items,
  };

  try {
    const result = await createSale(input);
    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath("/orders");
    revalidatePath("/customers");
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order.";
    const status =
      message.includes("out of stock") ||
      message.includes("available") ||
      message.includes("quantity") ||
      message.includes("valid sale date") ||
      message.includes("not found") ||
      message.includes("required") ||
      message.includes("Add at least") ||
      message.includes("Customer")
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
