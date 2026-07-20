import { NextResponse } from "next/server";
import { acceptInvitation } from "@/lib/users-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    if (!token) throw new Error("Invitation token is required.");
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const user = await acceptInvitation(token, password);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation.";
    const status = /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
