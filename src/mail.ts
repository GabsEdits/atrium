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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.mail.resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: config.mail.from,
      to: [email],
      subject: "Reset your Atrium password",
      text:
        `Use this one-hour link to reset your Atrium password:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Password reset email failed with status ${response.status}.`,
    );
  }
}
