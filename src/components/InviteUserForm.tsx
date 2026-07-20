"use client";

import { useState } from "react";
import { Check, Copy, Mail, Send } from "lucide-react";
import { UserInvitation } from "@/types/user";

export default function InviteUserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setInvitation(null);
    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, isSuperAdmin }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to send invitation."
        );
      }
      setInvitation(data.data as UserInvitation);
      setUsername("");
      setEmail("");
      setIsSuperAdmin(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to send invitation."
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!invitation?.inviteLink) return;
    await navigator.clipboard.writeText(invitation.inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-brand-200/60 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-brand-100 p-2.5 text-brand-700">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-brand-950">
            Invite a user
          </h2>
          <p className="mt-0.5 text-sm text-brand-500">
            They will receive a secure link to create their password.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="invite-username"
            className="mb-1.5 block text-sm font-medium text-brand-700"
          >
            Username
          </label>
          <input
            id="invite-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            disabled={busy}
            autoComplete="off"
            className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
            placeholder="newuser"
          />
        </div>
        <div>
          <label
            htmlFor="invite-email"
            className="mb-1.5 block text-sm font-medium text-brand-700"
          >
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={busy}
            autoComplete="email"
            className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
            placeholder="newuser@example.com"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={(event) => setIsSuperAdmin(event.target.checked)}
            disabled={busy}
            className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
          />
          Grant super admin access
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {busy ? "Sending…" : "Send invitation"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {invitation && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">
            Invitation created for {invitation.email}
          </p>
          <p className="mt-1 text-emerald-800">{invitation.message}</p>
          {invitation.inviteLink && (
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 font-medium text-emerald-800 hover:bg-emerald-100"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy invite link"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
