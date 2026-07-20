import { USERS_API_URL } from "@/lib/config";
import {
  AuthUser,
  CreateUserInput,
  InviteDetails,
  InviteUserInput,
  LoginInput,
  ManagedUser,
  UpdateUserInput,
  UserInvitation,
} from "@/types/user";

const USERS_FETCH_TIMEOUT_MS = 8_000;

interface ApiUser {
  id: number;
  username?: string | null;
  email?: string | null;
  password?: string | null;
  is_super_admin?: boolean | null;
}

interface ApiUsersResponse {
  success: boolean;
  count?: number;
  data: ApiUser[];
  error?: string;
}

interface ApiUserResponse {
  success: boolean;
  data?: ApiUser | { id: number; message?: string };
  error?: string;
  message?: string;
}

interface ApiInvitation {
  username: string;
  email: string;
  is_super_admin?: boolean;
  expires_at: string;
  email_sent?: boolean;
  invite_link?: string;
  message?: string;
}

interface ApiInvitationResponse {
  success: boolean;
  data?: ApiInvitation;
  error?: string;
  message?: string;
}

function mapAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: String(apiUser.id),
    username: apiUser.username?.trim() || "",
    email: apiUser.email?.trim() || undefined,
    isSuperAdmin: Boolean(apiUser.is_super_admin),
  };
}

function mapManagedUser(apiUser: ApiUser): ManagedUser {
  return {
    id: String(apiUser.id),
    username: apiUser.username?.trim() || "",
    email: apiUser.email?.trim() || undefined,
    isSuperAdmin: Boolean(apiUser.is_super_admin),
  };
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), USERS_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "The users service timed out. Check that the API is reachable, then try again."
      );
    }
    if (
      error instanceof TypeError ||
      (error instanceof Error && /fetch failed|network/i.test(error.message))
    ) {
      throw new Error(
        "Could not connect to the users service. Check your network and API host, then try again."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchUsersFromApi(): Promise<ApiUser[]> {
  const response = await fetchWithTimeout(USERS_API_URL);

  if (!response.ok) {
    throw new Error(
      `Could not reach the users service (${response.status}). Try again in a moment.`
    );
  }

  const json: ApiUsersResponse = await response.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.error ?? "Invalid users API response");
  }

  return json.data;
}

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const users = await fetchUsersFromApi();
  return users
    .map(mapManagedUser)
    .sort((a, b) => a.username.localeCompare(b.username));
}

export async function getManagedUserById(
  id: string
): Promise<ManagedUser | null> {
  const users = await fetchUsersFromApi();
  const match = users.find((user) => String(user.id) === String(id));
  return match ? mapManagedUser(match) : null;
}

/**
 * Authenticate against the users table.
 * Credentials are checked server-side only; passwords are never returned.
 */
export async function authenticateUser(
  input: LoginInput
): Promise<AuthUser> {
  const username = input.username.trim();
  const password = input.password;

  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  const users = await fetchUsersFromApi();
  const match = users.find(
    (user) =>
      (user.username ?? "").trim() === username &&
      (user.password ?? "") === password
  );

  if (!match) {
    throw new Error("Invalid username or password.");
  }

  return mapAuthUser(match);
}

export async function createUserInApi(
  input: CreateUserInput
): Promise<ManagedUser> {
  const username = input.username.trim();
  const password = input.password;

  if (!username) throw new Error("Username is required.");
  if (!password) throw new Error("Password is required.");

  const existing = await fetchUsersFromApi();
  if (
    existing.some(
      (user) => (user.username ?? "").trim().toLowerCase() === username.toLowerCase()
    )
  ) {
    throw new Error("That username is already taken.");
  }

  const response = await fetchWithTimeout(USERS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      is_super_admin: Boolean(input.isSuperAdmin),
    }),
  });

  const json: ApiUserResponse = await response.json();

  if (!response.ok || !json.success || !json.data || !("username" in json.data)) {
    throw new Error(
      json.error ?? json.message ?? `Failed to create user (${response.status})`
    );
  }

  return mapManagedUser(json.data);
}

export async function updateUserInApi(
  id: string,
  input: UpdateUserInput
): Promise<ManagedUser> {
  const users = await fetchUsersFromApi();
  const existing = users.find((user) => String(user.id) === String(id));
  if (!existing) {
    throw new Error("User not found.");
  }

  const username = (input.username ?? existing.username ?? "").trim();
  const email = (input.email ?? existing.email ?? "").trim().toLowerCase();
  const password =
    input.password != null && input.password !== ""
      ? input.password
      : existing.password ?? "";
  const isSuperAdmin =
    input.isSuperAdmin != null
      ? Boolean(input.isSuperAdmin)
      : Boolean(existing.is_super_admin);

  if (!username) throw new Error("Username is required.");
  if (!email) throw new Error("Email is required.");
  if (!password) throw new Error("Password is required.");

  const response = await fetchWithTimeout(`${USERS_API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      is_super_admin: isSuperAdmin,
    }),
  });

  const json: ApiUserResponse = await response.json();

  if (!response.ok || !json.success || !json.data || !("username" in json.data)) {
    throw new Error(
      json.error ?? json.message ?? `Failed to update user (${response.status})`
    );
  }

  return mapManagedUser(json.data);
}

export async function deleteUserInApi(id: string): Promise<void> {
  const response = await fetchWithTimeout(`${USERS_API_URL}/${id}`, {
    method: "DELETE",
  });

  const json: ApiUserResponse = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.error ?? json.message ?? `Failed to delete user (${response.status})`
    );
  }
}

export async function inviteUserInApi(
  input: InviteUserInput
): Promise<UserInvitation> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  if (!username) throw new Error("Username is required.");
  if (!email) throw new Error("Email is required.");

  const response = await fetchWithTimeout(`${USERS_API_URL}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      is_super_admin: Boolean(input.isSuperAdmin),
    }),
  });
  const json: ApiInvitationResponse = await response.json();
  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.error ?? json.message ?? `Failed to send invitation (${response.status})`
    );
  }

  return {
    username: json.data.username,
    email: json.data.email,
    isSuperAdmin: Boolean(json.data.is_super_admin),
    expiresAt: json.data.expires_at,
    emailSent: Boolean(json.data.email_sent),
    inviteLink: json.data.invite_link ?? "",
    message: json.data.message ?? "Invitation created.",
  };
}

export async function validateInvitation(
  token: string
): Promise<InviteDetails> {
  const response = await fetchWithTimeout(
    `${USERS_API_URL}/invite/${encodeURIComponent(token)}`
  );
  const json: ApiInvitationResponse = await response.json();
  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.error ?? json.message ?? `Failed to validate invitation (${response.status})`
    );
  }
  return {
    username: json.data.username,
    email: json.data.email,
    expiresAt: json.data.expires_at,
  };
}

export async function acceptInvitation(
  token: string,
  password: string
): Promise<ManagedUser> {
  const response = await fetchWithTimeout(`${USERS_API_URL}/accept-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const json: ApiUserResponse = await response.json();
  if (!response.ok || !json.success || !json.data || !("username" in json.data)) {
    throw new Error(
      json.error ?? json.message ?? `Failed to accept invitation (${response.status})`
    );
  }
  return mapManagedUser(json.data);
}
