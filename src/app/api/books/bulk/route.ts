import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteBooks } from "@/lib/books";

export async function POST(request: Request) {
  let ids: string[];

  try {
    const body: { ids?: unknown } = await request.json();
    ids = Array.isArray(body.ids)
      ? body.ids.filter(
          (id: unknown): id is string => typeof id === "string" && id.length > 0
        )
      : [];
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "Select at least one book to delete." },
      { status: 400 }
    );
  }

  try {
    await deleteBooks(ids);
    revalidatePath("/");
    revalidatePath("/books");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete books.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
