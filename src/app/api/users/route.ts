import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  createUserInApi,
  listManagedUsers,
} from "@/lib/users-api";

async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (!user.isSuperAdmin) {
    return {
      error: NextResponse.json(
        { success: false, error: "Only super admins can manage users." },
        { status: 403 }
      ),
    };
  }
  return { user };
}

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const users = await listManagedUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load users.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  let body: {
    username?: unknown;
    password?: unknown;
    isSuperAdmin?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const user = await createUserInApi({
      username: String(body.username ?? ""),
      password: String(body.password ?? ""),
      isSuperAdmin: Boolean(body.isSuperAdmin),
    });
    revalidatePath("/settings");
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user.";
    const status =
      message.includes("required") || message.includes("taken") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
