import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { inviteUserInApi } from "@/lib/users-api";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!user.isSuperAdmin) {
    return NextResponse.json(
      { success: false, error: "Only super admins can invite users." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const invitation = await inviteUserInApi({
      username: String(body.username ?? ""),
      email: String(body.email ?? ""),
      isSuperAdmin: Boolean(body.isSuperAdmin),
    });
    return NextResponse.json(
      { success: true, data: invitation },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send invitation.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
