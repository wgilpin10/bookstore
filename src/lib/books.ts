import { createBookInApi, deleteBookFromApi, fetchBooksFromApi, updateBookInApi } from "@/lib/books-api";
import { Book, CreateBookInput, UpdateBookInput } from "@/types/book";

export async function getBooks(): Promise<Book[]> {
  return fetchBooksFromApi();
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  return createBookInApi(input);
}

export async function updateBook(
  id: string,
  input: UpdateBookInput
): Promise<Book> {
  return updateBookInApi(id, input);
}

export async function deleteBook(id: string): Promise<void> {
  return deleteBookFromApi(id);
}

export async function deleteBooks(ids: string[]): Promise<void> {
  const results = await Promise.allSettled(ids.map((id) => deleteBookFromApi(id)));
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length > 0) {
    throw new Error(
      `Failed to delete ${failures.length} of ${ids.length} book(s).`
    );
  }
}
