import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteBook, updateBook } from "@/lib/books";
import { parseUpdateBookInput } from "@/lib/book-form";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Book ID is required." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = parseUpdateBookInput(body);
  if ("error" in parsed) {
    return NextResponse.json(
      { success: false, error: parsed.error },
      { status: 400 }
    );
  }

  try {
    const book = await updateBook(id, parsed);
    revalidatePath("/");
    revalidatePath("/books");
    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update book.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Book ID is required." },
      { status: 400 }
    );
  }

  try {
    await deleteBook(id);
    revalidatePath("/");
    revalidatePath("/books");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete book.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
