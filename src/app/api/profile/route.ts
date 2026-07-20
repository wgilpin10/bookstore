import { NextResponse } from "next/server";
import { createSession, getSessionUser } from "@/lib/auth";
import { authenticateUser, updateUserInApi } from "@/lib/users-api";

export async function PUT(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: {
    username?: unknown;
    email?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!username || !email || !currentPassword) {
    return NextResponse.json(
      {
        success: false,
        error: "Username, email, and current password are required.",
      },
      { status: 400 }
    );
  }

  try {
    await authenticateUser({
      username: sessionUser.username,
      password: currentPassword,
    });

    const updated = await updateUserInApi(sessionUser.id, {
      username,
      email,
      password: newPassword || currentPassword,
      isSuperAdmin: sessionUser.isSuperAdmin,
    });

    const nextSession = {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      isSuperAdmin: updated.isSuperAdmin,
    };
    await createSession(nextSession);

    return NextResponse.json({ success: true, data: nextSession });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";
    const status =
      message.includes("Invalid") || message.includes("required") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
