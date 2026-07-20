"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { InviteDetails } from "@/types/user";

export default function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("This invitation link is missing its token.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function validate() {
      try {
        const response = await fetch(
          `/api/users/invite/${encodeURIComponent(token)}`,
          { signal: controller.signal }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success !== true) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "This invitation is invalid or has expired."
          );
        }
        setDetails(data.data as InviteDetails);
      } catch (validationError) {
        if (
          validationError instanceof Error &&
          validationError.name === "AbortError"
        ) {
          return;
        }
        setError(
          validationError instanceof Error
            ? validationError.message
            : "This invitation is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    }
    validate();
    return () => controller.abort();
  }, [token]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/users/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to create your account."
        );
      }
      setComplete(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-xl bg-brand-50" aria-label="Validating invitation" />
    );
  }

  if (complete) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-950">
          Account created
        </h2>
        <p className="mt-2 text-sm text-brand-600">
          Your password is ready. You can now sign in as {details?.username}.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  if (!details) {
    return (
      <div>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "This invitation is invalid or has expired."}
        </p>
        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
        Creating an account for <strong>{details.username}</strong>
        <span className="block text-brand-500">{details.email}</span>
      </div>
      <div>
        <label
          htmlFor="new-password"
          className="mb-1.5 block text-sm font-medium text-brand-700"
        >
          Password
        </label>
        <PasswordInput
          id="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
          disabled={submitting}
          autoComplete="new-password"
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
          placeholder="At least 6 characters"
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1.5 block text-sm font-medium text-brand-700"
        >
          Confirm password
        </label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={6}
          required
          disabled={submitting}
          autoComplete="new-password"
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
          placeholder="Repeat your password"
        />
      </div>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
