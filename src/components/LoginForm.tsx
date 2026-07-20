"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookMarked, Lock, User } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

const LOGIN_REQUEST_TIMEOUT_MS = 12_000;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing-in" | "redirecting">(
    "idle"
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("signing-in");
    setError(null);

    let redirecting = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      LOGIN_REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Invalid username or password."
        );
        return;
      }

      redirecting = true;
      setStatus("redirecting");
      const nextPath = searchParams.get("next");
      const destination =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/";
      // Hard navigation applies the session cookie cleanly and avoids hanging
      // on a slow client-side router.refresh().
      window.location.assign(destination);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "Sign in timed out. The users service may be unreachable. Please try again."
        );
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      if (!redirecting) {
        setLoading(false);
        setStatus("idle");
      }
    }
  }

  const buttonLabel =
    status === "redirecting"
      ? "Redirecting…"
      : loading
        ? "Signing in…"
        : "Sign in";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-brand-700"
        >
          Username
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-3 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
            placeholder="Enter your username"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-brand-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export function LoginBrand() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
        <BookMarked className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl font-bold text-brand-950">
        Bookshop
      </h1>
      <p className="mt-2 text-sm text-brand-500">
        Sign in to manage inventory, orders, and customers.
      </p>
    </div>
  );
}
