"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
} from "lucide-react";
import InviteUserForm from "@/components/InviteUserForm";
import { AuthUser, ManagedUser } from "@/types/user";

export default function UserManagementView({
  currentUser,
  initialUsers,
}: {
  currentUser: AuthUser;
  initialUsers: ManagedUser[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <InviteUserForm />

      {(error || message) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-sm">
        <div className="border-b border-brand-200/60 px-6 py-5">
          <h2 className="font-display text-xl font-bold text-brand-950">
            All users
          </h2>
          <p className="mt-0.5 text-sm text-brand-500">
            Review accounts and use the three-dot menu to change permissions or
            delete an account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                  Username
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-brand-500">
                  Role
                </th>
                <th className="w-20 px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-brand-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-brand-50/40">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-brand-900">
                      {user.username}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-xs font-medium text-brand-400">
                          (you)
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-600">
                    {user.email || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.isSuperAdmin
                          ? "bg-brand-100 text-brand-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.isSuperAdmin ? "Super admin" : "Standard user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionsMenu
                      user={user}
                      currentUser={currentUser}
                      onUpdated={(updated) => {
                        setUsers((current) =>
                          current.map((row) =>
                            row.id === updated.id ? updated : row
                          )
                        );
                        setError(null);
                        setMessage(
                          `${updated.username} is now ${
                            updated.isSuperAdmin
                              ? "a super admin"
                              : "a standard user"
                          }.`
                        );
                        router.refresh();
                      }}
                      onDeleted={() => {
                        setUsers((current) =>
                          current.filter((row) => row.id !== user.id)
                        );
                        setError(null);
                        setMessage(`Deleted user “${user.username}”.`);
                        router.refresh();
                      }}
                      onError={(text) => {
                        setMessage(null);
                        setError(text);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UserActionsMenu({
  user,
  currentUser,
  onUpdated,
  onDeleted,
  onError,
}: {
  user: ManagedUser;
  currentUser: AuthUser;
  onUpdated: (user: ManagedUser) => void;
  onDeleted: () => void;
  onError: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isCurrentUser = user.id === currentUser.id;

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function toggleRole() {
    setBusy(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuperAdmin: !user.isSuperAdmin }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        onError(
          typeof data.error === "string"
            ? data.error
            : "Failed to update permissions."
        );
        return;
      }
      onUpdated(data.data as ManagedUser);
    } catch {
      onError("Failed to update permissions.");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function deleteUser() {
    if (!window.confirm(`Delete user “${user.username}”?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        onError(
          typeof data.error === "string"
            ? data.error
            : "Failed to delete user."
        );
        return;
      }
      onDeleted();
    } catch {
      onError("Failed to delete user.");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy || isCurrentUser}
        aria-label={`Actions for ${user.username}`}
        className="rounded-lg p-2 text-brand-500 transition hover:bg-brand-100 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-brand-200 bg-white py-1 text-left shadow-lg">
          <button
            type="button"
            onClick={toggleRole}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            {user.isSuperAdmin ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {user.isSuperAdmin ? "Make standard user" : "Make super admin"}
          </button>
          <button
            type="button"
            onClick={deleteUser}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
