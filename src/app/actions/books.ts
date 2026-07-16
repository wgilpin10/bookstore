"use server";

import { revalidatePath } from "next/cache";
import { createBook, deleteBook, deleteBooks } from "@/lib/books";
import { CreateBookInput } from "@/types/book";

type ActionResult = { success: true } | { error: string };

function revalidateBookPages() {
  revalidatePath("/");
  revalidatePath("/books");
}

function parseBookInput(formData: FormData): CreateBookInput | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const costPriceRaw = String(formData.get("cost_price") ?? "").trim();
  const cost_price = costPriceRaw ? Number(costPriceRaw) : undefined;

  if (!title) return { error: "Title is required." };
  if (!author) return { error: "Author is required." };
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price." };
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: "Enter a valid quantity." };
  }
  if (cost_price != null && (!Number.isFinite(cost_price) || cost_price < 0)) {
    return { error: "Enter a valid cost price." };
  }

  return { title, author, price, quantity, cost_price };
}

export async function addBookAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseBookInput(formData);

  if ("error" in parsed) {
    return parsed;
  }

  try {
    await createBook(parsed);
    revalidateBookPages();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add book.";
    return { error: message };
  }
}

export async function deleteBookAction(id: string): Promise<ActionResult> {
  if (!id) {
    return { error: "Book ID is required." };
  }

  try {
    await deleteBook(id);
    revalidateBookPages();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete book.";
    return { error: message };
  }
}

export async function deleteBooksAction(ids: string[]): Promise<ActionResult> {
  if (ids.length === 0) {
    return { error: "Select at least one book to delete." };
  }

  try {
    await deleteBooks(ids);
    revalidateBookPages();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete books.";
    return { error: message };
  }
}
