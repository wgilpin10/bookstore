"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChevronRight } from "lucide-react";
import { navItems } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-brand-200/60 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-brand-200/60 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <BookMarked className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-brand-950">
            Bookshop
          </h1>
          <p className="text-xs text-brand-500">Inventory Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-brand-400">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-brand-700 hover:bg-brand-50 hover:text-brand-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-brand-400 group-hover:text-brand-600"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-100 text-brand-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-brand-200/60 p-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-1 text-xs text-brand-200">
            Check our docs for inventory tips and best practices.
          </p>
          <button className="mt-3 w-full rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition hover:bg-white/25">
            View Documentation
          </button>
        </div>
      </div>
    </aside>
  );
}
