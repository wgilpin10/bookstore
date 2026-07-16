import { UpdateBookInput } from "@/types/book";

export function parseUpdateBookInput(
  body: unknown
): UpdateBookInput | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }

  const data = body as Record<string, unknown>;
  const title = String(data.title ?? "").trim();
  const author = String(data.author ?? "").trim();
  const price = Number(data.price);
  const quantity = Number(data.quantity);
  const costPriceRaw = data.cost_price;
  const cost_price =
    costPriceRaw == null || costPriceRaw === ""
      ? undefined
      : Number(costPriceRaw);

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
