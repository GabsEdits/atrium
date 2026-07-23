import type { AtriumConfig } from "./config.ts";

export async function sendPasswordReset(
  config: AtriumConfig,
  email: string,
  resetUrl: string,
): Promise<void> {
  if (!config.mail.resendApiKey) {
    console.log(`Atrium password reset for ${email}: ${resetUrl}`);
    return;
  }

  await sendEmail(config, {
    to: email,
    subject: "Reset your Atrium password",
    text:
      `Use this one-hour link to reset your Atrium password:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  });
}

export async function sendInvitation(
  config: AtriumConfig,
  email: string,
  workspaceName: string,
  role: string,
  inviteUrl: string,
): Promise<boolean> {
  if (!config.mail.resendApiKey) return false;

  await sendEmail(config, {
    to: email,
    subject: `Join ${workspaceName} on Atrium`,
    text:
      `You have been invited to join ${workspaceName} as ${role}.\n\nAccept this seven-day invitation:\n${inviteUrl}\n\nIf you were not expecting this invitation, ignore this email.`,
  });
  return true;
}

async function sendEmail(
  config: AtriumConfig,
  message: { to: string; subject: string; text: string },
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.mail.resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: config.mail.from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Email delivery failed with status ${response.status}.`,
    );
  }
}
