import { escapeHtml, page } from "./shared.ts";

export function renderAuth(
  mode: "setup" | "login",
  error?: string,
  oidcEnabled = false,
): string {
  const setup = mode === "setup";
  return page(
    setup ? "Set up Atrium" : "Sign in · Atrium",
    `<div class="auth-shell">
      <a class="wordmark" href="/" aria-label="Atrium home">
        <span class="brand-mark brand-mark-small">A</span>
        <span>Atrium</span>
      </a>
      <main class="auth-card">
        <div class="auth-heading">
          <p class="eyebrow">${setup ? "First-run setup" : "Welcome back"}</p>
          <h1>${setup ? "Make it yours." : "Sign in to Atrium."}</h1>
          <p>${
      setup
        ? "Create the owner account and your first private workspace."
        : "Continue to your knowledge space."
    }</p>
        </div>
        ${
      error ? `<div class="alert" role="alert">${escapeHtml(error)}</div>` : ""
    }
        <form method="post" action="/${mode}" class="form-stack">
          ${
      setup
        ? `<label>
              <span>Your name</span>
              <input name="name" autocomplete="name" required autofocus>
            </label>
            <label>
              <span>Workspace name</span>
              <input name="workspace" placeholder="Acme knowledge" required>
            </label>`
        : ""
    }
          <label>
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required
              ${setup ? "" : "autofocus"}>
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password"
              autocomplete="${setup ? "new-password" : "current-password"}"
              minlength="12" required>
            ${setup ? "<small>At least 12 characters.</small>" : ""}
          </label>
          <button class="button button-primary button-full" type="submit">
            ${setup ? "Create workspace" : "Sign in"}
          </button>
          ${
      setup
        ? ""
        : '<a class="form-link" href="/forgot-password">Forgot password?</a>'
    }
        </form>
        ${
      !setup && oidcEnabled
        ? `<div class="auth-divider"><span>or</span></div>
          <a class="button button-secondary button-full" href="/auth/oidc">
            Continue with single sign-on
          </a>`
        : ""
    }
      </main>
      <p class="auth-footer">Atrium · Powered by Steno</p>
    </div>`,
    "auth-body",
  );
}

export function renderNoWorkspace(name: string): string {
  return page(
    "No workspace access · Atrium",
    `<div class="auth-shell">
      <a class="wordmark" href="/" aria-label="Atrium home">
        <span class="brand-mark brand-mark-small">A</span>
        <span>Atrium</span>
      </a>
      <main class="auth-card">
        <div class="auth-heading">
          <p class="eyebrow">Workspace access</p>
          <h1>No workspace is assigned.</h1>
          <p>${
      escapeHtml(name)
    }, your account is signed in, but it is not a member
            of a workspace. Ask a workspace owner for an invitation, then open
            its link in this browser.</p>
        </div>
        <form method="post" action="/logout">
          <button class="button button-secondary button-full" type="submit">
            Sign out
          </button>
        </form>
      </main>
      <p class="auth-footer">Atrium · Powered by Steno</p>
    </div>`,
    "auth-body",
  );
}
