import { Book } from "@/types/book";
import { formatCurrency, getBookStockStatus } from "@/lib/utils";

export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

interface ExportRow {
  ID: string;
  Title: string;
  Author: string;
  Price: number;
  "Cost Price": number | "";
  Quantity: number;
  Value: number;
  Status: string;
}

const EXPORT_HEADERS: (keyof ExportRow)[] = [
  "ID",
  "Title",
  "Author",
  "Price",
  "Cost Price",
  "Quantity",
  "Value",
  "Status",
];

function booksToRows(books: Book[]): ExportRow[] {
  return books.map((book) => ({
    ID: book.id,
    Title: book.title,
    Author: book.author,
    Price: book.price,
    "Cost Price": book.cost_price ?? "",
    Quantity: book.quantity,
    Value: book.price * book.quantity,
    Status: getBookStockStatus(book),
  }));
}

function getExportFilename(format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10);
  const extensions: Record<ExportFormat, string> = {
    csv: "csv",
    xlsx: "xlsx",
    json: "json",
    pdf: "pdf",
  };
  return `bookshop-inventory-${date}.${extensions[format]}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportBooksToCsv(books: Book[]): void {
  const rows = booksToRows(books);
  const lines = [
    EXPORT_HEADERS.join(","),
    ...rows.map((row) =>
      EXPORT_HEADERS.map((header) => escapeCsvCell(row[header])).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, getExportFilename("csv"));
}

export async function exportBooksToXlsx(books: Book[]): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = booksToRows(books);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
  XLSX.writeFile(workbook, getExportFilename("xlsx"));
}

export function exportBooksToJson(books: Book[]): void {
  const rows = booksToRows(books);
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, getExportFilename("json"));
}

export async function exportBooksToPdf(books: Book[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const rows = booksToRows(books);

  const doc = new jsPDF({ orientation: "landscape" });
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFontSize(18);
  doc.text("Bookshop Inventory Report", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated ${date} · ${books.length} book${books.length === 1 ? "" : "s"}`,
    14,
    26
  );
  doc.setTextColor(0);

  const tableBody = rows.map((row) => [
    row.ID,
    row.Title,
    row.Author,
    formatCurrency(row.Price),
    row["Cost Price"] !== ""
      ? formatCurrency(row["Cost Price"] as number)
      : "—",
    String(row.Quantity),
    formatCurrency(row.Value),
    row.Status,
  ]);

  autoTable(doc, {
    head: [EXPORT_HEADERS],
    body: tableBody,
    startY: 32,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [68, 64, 60] },
    alternateRowStyles: { fillColor: [250, 249, 247] },
  });

  doc.save(getExportFilename("pdf"));
}

export async function exportBooks(
  books: Book[],
  format: ExportFormat
): Promise<void> {
  switch (format) {
    case "csv":
      exportBooksToCsv(books);
      break;
    case "xlsx":
      await exportBooksToXlsx(books);
      break;
    case "json":
      exportBooksToJson(books);
      break;
    case "pdf":
      await exportBooksToPdf(books);
      break;
  }
}

export const exportFormatOptions: {
  format: ExportFormat;
  label: string;
  description: string;
}[] = [
  {
    format: "csv",
    label: "CSV",
    description: "Comma-separated values for spreadsheets",
  },
  {
    format: "xlsx",
    label: "Excel",
    description: "Microsoft Excel workbook",
  },
  {
    format: "pdf",
    label: "PDF",
    description: "Printable inventory report",
  },
  {
    format: "json",
    label: "JSON",
    description: "Structured data for apps and scripts",
  },
];
