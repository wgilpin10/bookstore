export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  isSuperAdmin: boolean;
}

export interface ManagedUser {
  id: string;
  username: string;
  email?: string;
  isSuperAdmin: boolean;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  isSuperAdmin: boolean;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  isSuperAdmin?: boolean;
}

export interface InviteUserInput {
  username: string;
  email: string;
  isSuperAdmin: boolean;
}

export interface UserInvitation {
  username: string;
  email: string;
  isSuperAdmin: boolean;
  expiresAt: string;
  emailSent: boolean;
  inviteLink: string;
  message: string;
}

export interface InviteDetails {
  username: string;
  email: string;
  expiresAt: string;
}
