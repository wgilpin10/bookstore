"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { AuthUser } from "@/types/user";

export default function ProfileSettingsView({
  currentUser,
}: {
  currentUser: AuthUser;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          currentPassword,
          newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to update profile."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <section className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
        <div className="border-b border-brand-200/60 px-6 py-5">
          <h2 className="font-display text-xl font-bold text-brand-950">
            Account details
          </h2>
          <p className="mt-0.5 text-sm text-brand-500">
            Update your username, email, or choose a new password.
          </p>
        </div>

        <form onSubmit={saveProfile} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-700">
                Username
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-brand-200 py-2.5 pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-brand-200 py-2.5 pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-brand-100 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-brand-900">
              Password and verification
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-brand-700">
                  Current password
                </label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  placeholder="Required to save changes"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-700">
                  New password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-700">
                  Confirm new password
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-brand-200/60 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-brand-950">
            Your access
          </h2>
          <p className="mt-1 text-sm text-brand-500">
            {currentUser.isSuperAdmin
              ? "Super admin — full access to user management and order refunds."
              : "Standard user — inventory, orders, customers, and analytics access."}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 text-brand-500" />
            <div>
              <h3 className="text-sm font-semibold text-brand-900">
                Security tip
              </h3>
              <p className="mt-1 text-sm leading-6 text-brand-500">
                Use a unique password and sign out when using a shared device.
                Sessions expire after seven days.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
