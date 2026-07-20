import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { deleteOrderInApi, updateOrderInApi } from "@/lib/orders-api";

function revalidateOrderViews() {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/analytics");
  revalidatePath("/books");
  revalidatePath("/settings");
}

async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  if (!user.isSuperAdmin) {
    return {
      error: NextResponse.json(
        { success: false, error: "Only super admins can modify orders." },
        { status: 403 }
      ),
    };
  }
  return { user };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;
  let body: {
    bookTitle?: unknown;
    author?: unknown;
    quantity?: unknown;
    unitPrice?: unknown;
    revenue?: unknown;
    profit?: unknown;
    soldAt?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const order = await updateOrderInApi(id, {
      bookTitle: String(body.bookTitle ?? ""),
      author: String(body.author ?? ""),
      quantity: Number(body.quantity),
      unitPrice: Number(body.unitPrice),
      revenue: body.revenue != null ? Number(body.revenue) : undefined,
      profit: body.profit != null ? Number(body.profit) : undefined,
      soldAt:
        typeof body.soldAt === "string" && body.soldAt.trim()
          ? body.soldAt.trim()
          : undefined,
    });
    revalidateOrderViews();
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order.";
    const status =
      message.includes("required") ||
      message.includes("valid") ||
      message.includes("positive")
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;

  try {
    await deleteOrderInApi(id);
    revalidateOrderViews();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel order.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
