import { BOOKS_API_URL } from "@/lib/config";
import { Book, CreateBookInput, UpdateBookInput } from "@/types/book";

interface ApiBook {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  cost_price?: string | number;
  status?: string;
  value?: number | string;
}

interface ApiBooksResponse {
  success: boolean;
  count?: number;
  data: ApiBook[];
}

interface ApiBookResponse {
  success: boolean;
  data: ApiBook;
  message?: string;
}

function mapApiBook(apiBook: ApiBook): Book {
  return {
    id: String(apiBook.id),
    title: apiBook.title,
    author: apiBook.author,
    price: apiBook.price,
    quantity: apiBook.quantity,
    cost_price:
      apiBook.cost_price != null ? Number(apiBook.cost_price) : undefined,
    status: apiBook.status,
  };
}

export async function fetchBooksFromApi(): Promise<Book[]> {
  const response = await fetch(BOOKS_API_URL, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch books (${response.status})`);
  }

  const json: ApiBooksResponse = await response.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Invalid books API response");
  }

  return json.data
    .map(mapApiBook)
    .sort((a, b) => Number(b.id) - Number(a.id));
}

export async function createBookInApi(
  input: CreateBookInput
): Promise<Book> {
  const response = await fetch(BOOKS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json: ApiBookResponse = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? `Failed to create book (${response.status})`);
  }

  return mapApiBook(json.data);
}

export async function updateBookInApi(
  id: string,
  input: UpdateBookInput
): Promise<Book> {
  const response = await fetch(`${BOOKS_API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json: ApiBookResponse = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? `Failed to update book (${response.status})`);
  }

  return mapApiBook(json.data);
}

interface ApiDeleteResponse {
  success: boolean;
  data?: { id: number; message?: string };
  message?: string;
  error?: string;
}

export async function deleteBookFromApi(id: string): Promise<void> {
  const response = await fetch(`${BOOKS_API_URL}/${id}`, {
    method: "DELETE",
  });

  const json: ApiDeleteResponse = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.error ?? json.message ?? `Failed to delete book (${response.status})`
    );
  }
}
