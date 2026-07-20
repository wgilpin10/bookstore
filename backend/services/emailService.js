const nodemailer = require("nodemailer");

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildInviteLink(token) {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${frontendUrl}/accept-invite?token=${encodeURIComponent(token)}`;
}

async function sendInviteEmail({ email, username, token }) {
  const inviteLink = buildInviteLink(token);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@bookstore.local";
  const subject = "You're invited to Bookstore";
  const text = [
    `Hi ${username},`,
    "",
    "You have been invited to join Bookstore.",
    "Open the link below to set your password and activate your account:",
    "",
    inviteLink,
    "",
    "If you did not expect this email, you can ignore it.",
  ].join("\n");

  const html = `
    <p>Hi ${username},</p>
    <p>You have been invited to join Bookstore.</p>
    <p>
      <a href="${inviteLink}">Set your password</a>
      to activate your account.
    </p>
    <p>If the button does not work, copy this link:</p>
    <p>${inviteLink}</p>
  `;

  if (!isSmtpConfigured()) {
    console.log("[invite email] SMTP not configured — invite link for development:");
    console.log(inviteLink);
    return {
      sent: false,
      invite_link: inviteLink,
      message: "SMTP not configured; invite link logged and returned for development",
    };
  }

  const transport = createTransport();
  await transport.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    invite_link: inviteLink,
    message: "Invite email sent",
  };
}

module.exports = {
  sendInviteEmail,
  buildInviteLink,
};
