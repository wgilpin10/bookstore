"use client";

import { useEffect, useRef, useState } from "react";
import { Book } from "@/types/book";
import {
  ExportFormat,
  exportBooks,
  exportFormatOptions,
} from "@/lib/export-books";
import { ChevronDown, Download } from "lucide-react";

interface BooksExportMenuProps {
  books: Book[];
  disabled?: boolean;
}

export default function BooksExportMenu({
  books,
  disabled = false,
}: BooksExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleExport(format: ExportFormat) {
    if (books.length === 0 || exportingFormat) return;

    setExportingFormat(format);

    try {
      await exportBooks(books, format);
      setOpen(false);
    } catch {
      window.alert("Export failed. Please try again.");
    } finally {
      setExportingFormat(null);
    }
  }

  const isDisabled = disabled || books.length === 0;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={isDisabled}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-brand-200/60 bg-white shadow-lg">
          <div className="border-b border-brand-100 px-4 py-3">
            <p className="text-sm font-semibold text-brand-900">
              Download as
            </p>
            <p className="text-xs text-brand-500">
              {books.length} book{books.length === 1 ? "" : "s"} in current view
            </p>
          </div>
          <div className="p-2">
            {exportFormatOptions.map((option) => (
              <button
                key={option.format}
                type="button"
                onClick={() => void handleExport(option.format)}
                disabled={exportingFormat !== null}
                className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition hover:bg-brand-50 disabled:opacity-50"
              >
                <span className="text-sm font-medium text-brand-900">
                  {exportingFormat === option.format
                    ? `Exporting ${option.label}...`
                    : option.label}
                </span>
                <span className="text-xs text-brand-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
