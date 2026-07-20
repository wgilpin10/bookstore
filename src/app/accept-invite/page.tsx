import { Suspense } from "react";
import { BookMarked } from "lucide-react";
import AcceptInviteForm from "@/components/AcceptInviteForm";

export default function AcceptInvitePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(212, 131, 74, 0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(165, 85, 53, 0.12), transparent 50%), linear-gradient(180deg, #fdf8f3 0%, #f9ede0 100%)",
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-brand-200/70 bg-white/90 p-8 shadow-xl shadow-brand-900/5 backdrop-blur">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <BookMarked className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-950">
            Accept invitation
          </h1>
          <p className="mt-2 text-sm text-brand-500">
            Create a password to finish setting up your Bookshop account.
          </p>
        </div>
        <Suspense
          fallback={<div className="h-48 animate-pulse rounded-xl bg-brand-50" />}
        >
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
