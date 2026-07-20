const userModel = require("../models/userModel");
const inviteModel = require("../models/inviteModel");
const userView = require("../views/userView");
const { sendInviteEmail } = require("../services/emailService");

function parseBoolean(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: false };
  }

  if (typeof value === "boolean") {
    return { value };
  }

  if (value === "true" || value === "1" || value === 1) {
    return { value: true };
  }

  if (value === "false" || value === "0" || value === 0) {
    return { value: false };
  }

  return { error: `${fieldName} must be a boolean` };
}

function parseUserPayload(body) {
  const username = body.username;
  const password = body.password;
  const email = body.email;
  const is_super_admin = body.is_super_admin ?? body["is_super_admin?"];

  if (!username || String(username).trim() === "") {
    return { error: "username is required" };
  }

  if (!password || String(password).trim() === "") {
    return { error: "password is required" };
  }

  if (!email || String(email).trim() === "") {
    return { error: "email is required" };
  }

  const parsedIsSuperAdmin = parseBoolean(is_super_admin, "is_super_admin");
  if (parsedIsSuperAdmin.error) {
    return { error: parsedIsSuperAdmin.error };
  }

  return {
    data: {
      username: String(username).trim(),
      password: String(password),
      is_super_admin: parsedIsSuperAdmin.value,
      email: String(email).trim(),
    },
  };
}

function parseInvitePayload(body) {
  const username = body.username;
  const email = body.email;
  const is_super_admin = body.is_super_admin ?? body["is_super_admin?"];

  if (!username || String(username).trim() === "") {
    return { error: "username is required" };
  }

  if (!email || String(email).trim() === "") {
    return { error: "email is required" };
  }

  const parsedIsSuperAdmin = parseBoolean(is_super_admin, "is_super_admin");
  if (parsedIsSuperAdmin.error) {
    return { error: parsedIsSuperAdmin.error };
  }

  return {
    data: {
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      is_super_admin: parsedIsSuperAdmin.value,
    },
  };
}

function parseAcceptInvitePayload(body) {
  const token = body.token;
  const password = body.password;

  if (!token || String(token).trim() === "") {
    return { error: "token is required" };
  }

  if (!password || String(password).trim() === "") {
    return { error: "password is required" };
  }

  if (String(password).length < 6) {
    return { error: "password must be at least 6 characters" };
  }

  return {
    data: {
      token: String(token).trim(),
      password: String(password),
    },
  };
}

function getInviteStatus(invite) {
  if (!invite) {
    return { error: "Invite not found", status: 404 };
  }

  if (invite.used_at) {
    return { error: "Invite has already been used", status: 400 };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { error: "Invite has expired", status: 400 };
  }

  return { invite };
}

const userPresenter = {
  async getAllUsers(req, res) {
    try {
      const users = await userModel.findAll();
      userView.sendList(res, users);
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async getUserById(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return userView.sendBadRequest(res, "id must be a number");
      }

      const user = await userModel.findById(id);

      if (!user) {
        return userView.sendNotFound(res);
      }

      userView.sendSuccess(res, user);
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async createUser(req, res) {
    try {
      const parsed = parseUserPayload(req.body);

      if (parsed.error) {
        return userView.sendBadRequest(res, parsed.error);
      }

      const user = await userModel.create(parsed.data);
      userView.sendSuccess(res, user, 201);
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async updateUser(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return userView.sendBadRequest(res, "id must be a number");
      }

      const parsed = parseUserPayload(req.body);

      if (parsed.error) {
        return userView.sendBadRequest(res, parsed.error);
      }

      const user = await userModel.update(id, parsed.data);

      if (!user) {
        return userView.sendNotFound(res);
      }

      userView.sendSuccess(res, user);
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async deleteUser(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return userView.sendBadRequest(res, "id must be a number");
      }

      const deleted = await userModel.remove(id);

      if (!deleted) {
        return userView.sendNotFound(res);
      }

      userView.sendSuccess(res, { id: deleted.id, message: "User deleted successfully" });
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async inviteUser(req, res) {
    try {
      const parsed = parseInvitePayload(req.body);

      if (parsed.error) {
        return userView.sendBadRequest(res, parsed.error);
      }

      const existingUsername = await userModel.findByUsername(parsed.data.username);
      if (existingUsername) {
        return userView.sendBadRequest(res, "username is already taken");
      }

      const existingEmail = await userModel.findByEmail(parsed.data.email);
      if (existingEmail) {
        return userView.sendBadRequest(res, "email is already registered");
      }

      const expiryHours = Number(process.env.INVITE_EXPIRY_HOURS || 48);
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      const invite = await inviteModel.create({
        username: parsed.data.username,
        email: parsed.data.email,
        is_super_admin: parsed.data.is_super_admin,
        expiresAt,
      });

      const emailResult = await sendInviteEmail({
        email: invite.email,
        username: invite.username,
        token: invite.token,
      });

      userView.sendSuccess(
        res,
        {
          username: invite.username,
          email: invite.email,
          is_super_admin: invite.is_super_admin,
          expires_at: invite.expires_at,
          email_sent: emailResult.sent,
          invite_link: emailResult.invite_link,
          message: emailResult.message,
        },
        201
      );
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async getInvite(req, res) {
    try {
      const token = String(req.params.token || "").trim();

      if (!token) {
        return userView.sendBadRequest(res, "token is required");
      }

      const invite = await inviteModel.findByToken(token);
      const status = getInviteStatus(invite);

      if (status.error) {
        return userView.sendError(res, status.error, status.status);
      }

      userView.sendSuccess(res, {
        username: status.invite.username,
        email: status.invite.email,
        expires_at: status.invite.expires_at,
      });
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },

  async acceptInvite(req, res) {
    try {
      const parsed = parseAcceptInvitePayload(req.body);

      if (parsed.error) {
        return userView.sendBadRequest(res, parsed.error);
      }

      const invite = await inviteModel.findByToken(parsed.data.token);
      const status = getInviteStatus(invite);

      if (status.error) {
        return userView.sendError(res, status.error, status.status);
      }

      const existingUsername = await userModel.findByUsername(status.invite.username);
      if (existingUsername) {
        return userView.sendBadRequest(res, "username is already taken");
      }

      const existingEmail = await userModel.findByEmail(status.invite.email);
      if (existingEmail) {
        return userView.sendBadRequest(res, "email is already registered");
      }

      const user = await userModel.create({
        username: status.invite.username,
        email: status.invite.email,
        is_super_admin: status.invite.is_super_admin,
        password: parsed.data.password,
      });

      await inviteModel.markUsed(status.invite.id);

      userView.sendSuccess(
        res,
        {
          id: user.id,
          username: user.username,
          email: user.email,
          is_super_admin: user.is_super_admin,
          message: "Account created successfully",
        },
        201
      );
    } catch (err) {
      userView.sendError(res, err.message);
    }
  },
};

module.exports = userPresenter;
