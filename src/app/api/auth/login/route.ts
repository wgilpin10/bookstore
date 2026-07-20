import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { authenticateUser } from "@/lib/users-api";

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Username and password are required." },
      { status: 400 }
    );
  }

  try {
    const user = await authenticateUser({ username, password });
    await createSession(user);
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign in.";
    const status =
      message.includes("required") || message.includes("Invalid")
        ? 401
        : message.includes("timed out") ||
            message.includes("Could not connect") ||
            message.includes("Could not reach")
          ? 503
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
