import { promises as fs } from "fs";
import path from "path";
import { SaleRecord } from "@/types/customer";

const DATA_DIR = path.join(process.cwd(), "data");
const SALES_FILE = path.join(DATA_DIR, "sales.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SALES_FILE);
  } catch {
    await fs.writeFile(SALES_FILE, "[]", "utf8");
  }
}

export async function readSales(): Promise<SaleRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SALES_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeSales(sales: SaleRecord[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(SALES_FILE, JSON.stringify(sales, null, 2), "utf8");
}

export async function appendSale(sale: SaleRecord): Promise<void> {
  const sales = await readSales();
  sales.unshift(sale);
  await writeSales(sales);
}
