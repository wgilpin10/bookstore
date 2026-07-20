import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { deleteUserInApi, updateUserInApi } from "@/lib/users-api";

async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;
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
    const updated = await updateUserInApi(id, {
      username:
        body.username != null ? String(body.username) : undefined,
      password:
        body.password != null ? String(body.password) : undefined,
      isSuperAdmin:
        body.isSuperAdmin != null ? Boolean(body.isSuperAdmin) : undefined,
    });
    revalidatePath("/settings");
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update user.";
    const status =
      message.includes("required") || message.includes("not found")
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await params;

  if (auth.user && auth.user.id === id) {
    return NextResponse.json(
      { success: false, error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  try {
    await deleteUserInApi(id);
    revalidatePath("/settings");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete user.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
