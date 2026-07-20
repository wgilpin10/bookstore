import { Suspense } from "react";
import LoginForm, { LoginBrand } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(212, 131, 74, 0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(165, 85, 53, 0.12), transparent 50%), linear-gradient(180deg, #fdf8f3 0%, #f9ede0 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c66d3f' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-brand-200/70 bg-white/90 p-8 shadow-xl shadow-brand-900/5 backdrop-blur">
        <LoginBrand />
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-brand-50" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
