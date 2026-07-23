import type { User, WorkspaceOverview } from "../store.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderMfaChallenge(
  challenge: string,
  error?: string,
  returnTo = "",
): string {
  return page(
    "Two-factor authentication · Atrium",
    authCard(
      "Two-factor authentication",
      "Enter the six-digit code from your authenticator app.",
      `<form method="post" action="/login/mfa" class="form-stack">
        <input type="hidden" name="challenge" value="${escapeHtml(challenge)}">
        ${
        returnTo
          ? `<input type="hidden" name="returnTo" value="${
            escapeHtml(returnTo)
          }">`
          : ""
      }
        <label><span>Authentication code</span>
          <input name="code" autocomplete="one-time-code" required autofocus>
          <small>Use a six-digit authenticator code or a recovery code.</small></label>
        <button class="button button-primary button-full">Verify and sign in</button>
      </form>`,
      error,
    ),
    "auth-body",
  );
}

export function renderForgotPassword(sent = false): string {
  return page(
    "Reset password · Atrium",
    authCard(
      "Reset your password",
      sent
        ? "If the account exists, a recovery link has been sent."
        : "Enter your account email to receive a one-hour recovery link.",
      sent
        ? '<a class="button button-primary button-full" href="/login">Back to sign in</a>'
        : `<form method="post" action="/forgot-password" class="form-stack">
            <label><span>Email</span><input name="email" type="email"
              autocomplete="email" required autofocus></label>
            <button class="button button-primary button-full">Send recovery link</button>
          </form>`,
    ),
    "auth-body",
  );
}

export function renderResetPassword(token: string, error?: string): string {
  return page(
    "Choose a new password · Atrium",
    authCard(
      "Choose a new password",
      "This will sign out every existing session for the account.",
      `<form method="post" action="/reset-password/${escapeHtml(token)}"
          class="form-stack">
        <label><span>New password</span><input name="password" type="password"
          minlength="12" autocomplete="new-password" required autofocus>
          <small>At least 12 characters.</small></label>
        <button class="button button-primary button-full">Reset password</button>
      </form>`,
      error,
    ),
    "auth-body",
  );
}

export function renderAccountSecurity(
  user: User,
  workspace: WorkspaceOverview,
  pendingSecret?: string,
  error?: string,
  recoveryCodes?: string[],
): string {
  const issuer = encodeURIComponent("Atrium");
  const account = encodeURIComponent(user.email);
  const uri = pendingSecret
    ? `otpauth://totp/${issuer}:${account}?secret=${pendingSecret}&issuer=${issuer}`
    : "";
  return page(
    "Account security · Atrium",
    `<header class="settings-topbar">
      <a class="wordmark" href="/"><span class="brand-mark brand-mark-small">A</span>
        <span>Atrium</span></a><span>${escapeHtml(workspace.name)}</span>
      <span>${escapeHtml(user.name)}</span></header>
    <main class="settings-page">
      <header class="settings-heading"><div><p class="eyebrow">Your account</p>
        <h1>Security</h1><p>Protect your account with an authenticator app.</p></div>
        <a class="button button-secondary" href="/">Done</a></header>
      ${error ? `<div class="alert">${escapeHtml(error)}</div>` : ""}
      ${
      recoveryCodes
        ? `<section class="success-card recovery-codes">
            <strong>Save your recovery codes now</strong>
            <p>Each code works once. Store them somewhere separate from your authenticator.</p>
            <pre>${recoveryCodes.map(escapeHtml).join("\n")}</pre>
          </section>`
        : ""
    }
      <section class="settings-card">
        <h2>Two-factor authentication</h2>
        ${
      user.mfaEnabled
        ? `<p class="security-status"><span class="visibility-dot visibility-public"></span>
            Enabled</p>
            <form method="post" action="/account/mfa/disable">
              <button class="button button-danger">Disable MFA</button>
            </form>`
        : pendingSecret
        ? `<p>Add this secret to any TOTP authenticator, then enter its code.</p>
            <code class="secret-code">${escapeHtml(pendingSecret)}</code>
            <details><summary>Authenticator URI</summary>
              <code class="uri-code">${escapeHtml(uri)}</code></details>
            <form method="post" action="/account/mfa/confirm" class="inline-form mfa-form">
              <input type="hidden" name="secret" value="${
          escapeHtml(pendingSecret)
        }">
              <input name="code" inputmode="numeric" pattern="[0-9]{6}"
                placeholder="123456" aria-label="Authentication code" required>
              <button class="button button-primary">Enable MFA</button>
            </form>`
        : `<p>Require a rotating six-digit code after your password.</p>
            <form method="post" action="/account/mfa/start">
              <button class="button button-primary">Set up authenticator</button>
            </form>`
    }
      </section>
    </main>`,
    "app-body",
  );
}

function authCard(
  title: string,
  description: string,
  content: string,
  error?: string,
): string {
  return `<div class="auth-shell">
    <a class="wordmark" href="/"><span class="brand-mark brand-mark-small">A</span>
      <span>Atrium</span></a>
    <main class="auth-card"><div class="auth-heading"><h1>${
    escapeHtml(title)
  }</h1>
      <p>${escapeHtml(description)}</p></div>
      ${error ? `<div class="alert">${escapeHtml(error)}</div>` : ""}
      ${content}
    </main></div>`;
}
