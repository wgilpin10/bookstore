import { NextResponse } from "next/server";
import { validateInvitation } from "@/lib/users-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invitation = await validateInvitation(token);
    return NextResponse.json({ success: true, data: invitation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid invitation.";
    const status = /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
