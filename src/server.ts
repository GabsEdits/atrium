import type { AtriumOptions } from "./types.ts";
import { type AtriumConfig, loadConfig } from "./config.ts";
import { sendInvitation, sendPasswordReset } from "./mail.ts";
import { createOidcAuthorization, exchangeOidcCode } from "./oidc.ts";
import { AtriumStore } from "./store.ts";
import {
  clearSessionCookie,
  createSessionCookie,
  createTotpSecret,
  hashPassword,
  readSessionToken,
  verifyPassword,
  verifyTotpCode,
} from "./auth.ts";
import { renderApp } from "./ui/app.ts";
import { renderAuth, renderNoWorkspace } from "./ui/auth.ts";
import { renderEditor } from "./ui/editor.ts";
import { styles } from "./ui/styles.ts";
import { clientScript } from "./ui/client.ts";
import { renderPublicPage } from "./ui/public.ts";
import { renderWelcome } from "./ui/welcome.ts";
import { renderMarkdown } from "./renderer.ts";
import {
  renderAssetCreated,
  renderAssets,
  renderExistingInvitation,
  renderInvitation,
  renderMembers,
  renderRevisions,
  renderSearch,
  renderShareCreated,
} from "./ui/manage.ts";
import {
  renderAccountSecurity,
  renderForgotPassword,
  renderMfaChallenge,
  renderResetPassword,
} from "./ui/security.ts";

const requestRuntime = new WeakMap<Request, AtriumConfig>();
const dummyPasswordHash = hashPassword("atrium-invalid-account-password");

export type AtriumApp = {
  handler: Deno.ServeHandler;
  store: AtriumStore;
  config: AtriumConfig;
};

export function createApp(options: AtriumOptions = {}): AtriumApp {
  const config = loadConfig(options);
  Deno.mkdirSync(config.dataDirectory, { recursive: true });
  const store = new AtriumStore(`${config.dataDirectory}/atrium.db`);

  return {
    store,
    config,
    handler: (request) => handleRequest(request, store, config),
  };
}

export async function handleRequest(
  request: Request,
  store: AtriumStore,
  runtime: AtriumConfig = loadConfig({
    dataDirectory: ".atrium",
    baseUrl: new URL(request.url).origin,
  }),
): Promise<Response> {
  requestRuntime.set(request, runtime);
  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return json({ status: "ok" });
  }

  if (url.pathname === "/assets/app.css") {
    return new Response(styles, {
      headers: {
        "cache-control": "no-cache",
        "content-type": "text/css; charset=utf-8",
      },
    });
  }

  if (url.pathname === "/assets/app.js") {
    return new Response(clientScript, {
      headers: {
        "cache-control": "no-cache",
        "content-type": "text/javascript; charset=utf-8",
      },
    });
  }

  const publicMatch = url.pathname.match(
    /^\/s\/([^/]+)\/([^/]+)\/([^/]+)$/,
  );
  if (request.method === "GET" && publicMatch) {
    const document = store.getPublicPage(
      publicMatch[1],
      publicMatch[2],
      publicMatch[3],
    );
    return document
      ? html(renderPublicPage(document))
      : new Response("Not found", { status: 404 });
  }

  if (request.method === "POST" && url.pathname === "/api/preview") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return new Response("Unauthorized", { status: 401 });
    const body = await request.text();
    if (body.length > 1_000_000) {
      return new Response("Preview is too large", { status: 413 });
    }
    return new Response(renderMarkdown(body), {
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  const sharedMatch = url.pathname.match(/^\/shared\/([A-Za-z0-9_-]+)$/);
  if (request.method === "GET" && sharedMatch) {
    const document = await store.getSharedPage(sharedMatch[1]);
    return document
      ? html(renderPublicPage(document))
      : new Response("Not found", { status: 404 });
  }

  const fileMatch = url.pathname.match(/^\/files\/(\d+)\/[^/]+$/);
  if (request.method === "GET" && fileMatch) {
    const asset = store.getAsset(Number(fileMatch[1]));
    if (!asset) return new Response("Not found", { status: 404 });
    const user = await currentUser(request, store);
    if (!store.canReadAsset(user?.id ?? null, asset.id)) {
      return new Response("Not found", { status: 404 });
    }
    try {
      const content = await Deno.readFile(
        `${runtime.dataDirectory}/assets/${asset.storageName}`,
      );
      const inline = asset.mimeType.startsWith("image/");
      return new Response(content, {
        headers: {
          "cache-control": "private, max-age=3600",
          "content-disposition": `${
            inline ? "inline" : "attachment"
          }; filename="${safeHeaderFilename(asset.originalName)}"`,
          "content-type": asset.mimeType,
          "x-content-type-options": "nosniff",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  const inviteMatch = url.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)$/);
  if (inviteMatch) {
    const invitation = await store.getInvitation(inviteMatch[1]);
    if (!invitation) {
      return new Response("Invitation is invalid or expired.", { status: 404 });
    }
    if (request.method === "GET") {
      const signedIn = await currentUser(request, store);
      if (
        signedIn &&
        signedIn.email.toLowerCase() === invitation.email.toLowerCase()
      ) {
        return html(renderExistingInvitation(inviteMatch[1], invitation));
      }
      if (store.findUserByEmail(invitation.email)) {
        const returnTo = `/invite/${inviteMatch[1]}`;
        return redirect(
          `/login?returnTo=${encodeURIComponent(returnTo)}&email=${
            encodeURIComponent(invitation.email)
          }`,
        );
      }
      return html(renderInvitation(inviteMatch[1], invitation));
    }
    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      const form = await request.formData();
      const signedIn = await currentUser(request, store);
      if (form.get("acceptExisting") === "1" && signedIn) {
        try {
          await store.acceptInvitationForUser(inviteMatch[1], signedIn.id);
          return redirect("/");
        } catch (error) {
          return new Response((error as Error).message, { status: 403 });
        }
      }
      const name = String(form.get("name") ?? "").trim();
      const password = String(form.get("password") ?? "");
      if (!name || password.length < 12) {
        return html(
          renderInvitation(
            inviteMatch[1],
            invitation,
            "Enter your name and a password of at least 12 characters.",
          ),
          422,
        );
      }
      try {
        const user = await store.acceptInvitation(inviteMatch[1], {
          name,
          passwordHash: await hashPassword(password),
        });
        const token = await store.createSession(user.id);
        return redirect("/", {
          "set-cookie": createSessionCookie(token, runtime.secureCookies),
        });
      } catch (error) {
        return html(
          renderInvitation(
            inviteMatch[1],
            invitation,
            (error as Error).message,
          ),
          409,
        );
      }
    }
  }

  if (request.method === "GET" && url.pathname === "/") {
    if (!store.isConfigured()) {
      return html(renderWelcome());
    }

    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.findWorkspaceOverview(user.id);
    return html(
      workspace ? renderApp(user, workspace) : renderNoWorkspace(user.name),
    );
  }

  if (url.pathname === "/setup") {
    if (store.isConfigured()) return redirect("/");
    if (request.method === "GET") return html(renderAuth("setup"));
    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      return await completeSetup(request, store, runtime.secureCookies);
    }
  }

  if (url.pathname === "/login") {
    if (!store.isConfigured()) return redirect("/setup");
    if (request.method === "GET") {
      return html(
        renderAuth(
          "login",
          undefined,
          Boolean(runtime.oidc),
          safeReturnTo(url.searchParams.get("returnTo")),
          url.searchParams.get("email") ?? "",
        ),
      );
    }
    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      return await login(
        request,
        store,
        runtime.secureCookies,
        Boolean(runtime.oidc),
      );
    }
  }

  if (url.pathname === "/auth/oidc" && request.method === "GET") {
    if (!runtime.oidc) return new Response("Not found", { status: 404 });
    try {
      const destination = await createOidcAuthorization(
        runtime,
        (verifier) => store.createOidcState(verifier),
      );
      return redirect(destination);
    } catch (error) {
      return html(
        renderAuth("login", (error as Error).message, true),
        502,
      );
    }
  }

  if (url.pathname === "/auth/oidc/callback" && request.method === "GET") {
    if (!runtime.oidc) return new Response("Not found", { status: 404 });
    const state = url.searchParams.get("state") ?? "";
    const code = url.searchParams.get("code") ?? "";
    const verifier = state ? await store.consumeOidcState(state) : null;
    if (!verifier || !code) {
      return html(
        renderAuth(
          "login",
          "Single sign-on response is invalid or expired.",
          true,
        ),
        400,
      );
    }
    try {
      const identity = await exchangeOidcCode(runtime, code, verifier);
      const user = store.findOrCreateOidcUser({
        ...identity,
        autoProvision: runtime.oidc.autoProvision,
      });
      if (!user) {
        return html(
          renderAuth(
            "login",
            "This SSO account has not been invited to Atrium.",
            true,
          ),
          403,
        );
      }
      const session = await store.createSession(user.id);
      return redirect("/", {
        "set-cookie": createSessionCookie(session, runtime.secureCookies),
      });
    } catch (error) {
      return html(
        renderAuth("login", (error as Error).message, true),
        502,
      );
    }
  }

  if (url.pathname === "/login/mfa" && request.method === "POST") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const form = await request.formData();
    const challenge = String(form.get("challenge") ?? "");
    const returnTo = safeReturnTo(String(form.get("returnTo") ?? ""));
    const code = String(form.get("code") ?? "").trim();
    const user = await store.getMfaChallenge(challenge);
    const validCode = user?.mfaSecret
      ? await verifyTotpCode(user.mfaSecret, code) ||
        await store.consumeMfaRecoveryCode(user.id, code)
      : false;
    if (
      !user?.mfaEnabled || !user.mfaSecret ||
      !validCode
    ) {
      await store.recordMfaFailure(challenge);
      return html(
        renderMfaChallenge(
          challenge,
          "The authentication code is incorrect.",
          returnTo,
        ),
        401,
      );
    }
    await store.getMfaChallenge(challenge, true);
    const token = await store.createSession(user.id);
    return redirect(returnTo || "/", {
      "set-cookie": createSessionCookie(token, runtime.secureCookies),
    });
  }

  if (url.pathname === "/forgot-password") {
    if (request.method === "GET") return html(renderForgotPassword());
    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      const form = await request.formData();
      const email = String(form.get("email") ?? "").trim().toLowerCase();
      const token = await store.createPasswordReset(email);
      if (token) {
        await sendPasswordReset(
          runtime,
          email,
          `${runtime.baseUrl}/reset-password/${token}`,
        );
      }
      return html(renderForgotPassword(true));
    }
  }

  const resetMatch = url.pathname.match(
    /^\/reset-password\/([A-Za-z0-9_-]+)$/,
  );
  if (resetMatch) {
    if (request.method === "GET") {
      return html(renderResetPassword(resetMatch[1]));
    }
    if (request.method === "POST") {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      const form = await request.formData();
      const password = String(form.get("password") ?? "");
      if (password.length < 12) {
        return html(
          renderResetPassword(
            resetMatch[1],
            "Use a password of at least 12 characters.",
          ),
          422,
        );
      }
      const changed = await store.resetPassword(
        resetMatch[1],
        await hashPassword(password),
      );
      return changed ? redirect("/login") : html(
        renderResetPassword(
          resetMatch[1],
          "This recovery link is invalid or expired.",
        ),
        404,
      );
    }
  }

  if (request.method === "POST" && url.pathname === "/logout") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const token = readSessionToken(request);
    if (token) await store.deleteSession(token);
    return redirect("/login", { "set-cookie": clearSessionCookie() });
  }

  if (url.pathname === "/settings/members") {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.getWorkspaceOverview(user.id);
    try {
      const members = store.listMembers(user.id, workspace.id);
      const inviteToken = url.searchParams.get("invite");
      const inviteUrl = inviteToken
        ? `${runtime.baseUrl}/invite/${inviteToken}`
        : undefined;
      const delivery = url.searchParams.get("delivery");
      const deliveryError = delivery === "failed"
        ? "The invitation was created, but its email could not be delivered. Copy and send the link below."
        : undefined;
      return html(
        renderMembers(
          user,
          workspace,
          members,
          inviteUrl,
          deliveryError,
          delivery === "sent",
        ),
      );
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (url.pathname === "/account/security" && request.method === "GET") {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    return html(
      renderAccountSecurity(
        user,
        store.getWorkspaceOverview(user.id),
        url.searchParams.get("secret") ?? undefined,
      ),
    );
  }

  if (url.pathname === "/account/mfa/start" && request.method === "POST") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const secret = createTotpSecret();
    store.setMfaSecret(user.id, secret, false);
    return redirect(`/account/security?secret=${encodeURIComponent(secret)}`);
  }

  if (url.pathname === "/account/mfa/confirm" && request.method === "POST") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const form = await request.formData();
    const secret = String(form.get("secret") ?? "");
    const code = String(form.get("code") ?? "");
    if (secret !== user.mfaSecret || !(await verifyTotpCode(secret, code))) {
      return html(
        renderAccountSecurity(
          user,
          store.getWorkspaceOverview(user.id),
          secret,
          "The authentication code is incorrect.",
        ),
        422,
      );
    }
    store.setMfaSecret(user.id, secret, true);
    const recoveryCodes = await store.createMfaRecoveryCodes(user.id);
    const updated = await currentUser(request, store);
    return html(
      renderAccountSecurity(
        updated ?? { ...user, mfaSecret: secret, mfaEnabled: true },
        store.getWorkspaceOverview(user.id),
        undefined,
        undefined,
        recoveryCodes,
      ),
    );
  }

  if (url.pathname === "/account/mfa/disable" && request.method === "POST") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    store.setMfaSecret(user.id, null, false);
    return redirect("/account/security");
  }

  if (request.method === "POST" && url.pathname === "/invitations") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.getWorkspaceOverview(user.id);
    const form = await request.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const role = form.get("role") === "reader" ? "reader" : "editor";
    if (!email.includes("@")) {
      return new Response("Invalid email", { status: 422 });
    }
    try {
      const token = await store.createInvitation(
        user.id,
        workspace.id,
        email,
        role,
      );
      const inviteUrl = `${runtime.baseUrl}/invite/${token}`;
      let delivery = "not-configured";
      try {
        if (
          await sendInvitation(
            runtime,
            email,
            workspace.name,
            role,
            inviteUrl,
          )
        ) {
          delivery = "sent";
        }
      } catch (error) {
        console.error("Atrium invitation email failed:", error);
        delivery = "failed";
      }
      return redirect(
        `/settings/members?invite=${
          encodeURIComponent(token)
        }&delivery=${delivery}`,
      );
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const memberMatch = url.pathname.match(
    /^\/members\/(\d+)\/(role|remove)$/,
  );
  if (request.method === "POST" && memberMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.getWorkspaceOverview(user.id);
    try {
      if (memberMatch[2] === "remove") {
        store.removeMember(user.id, workspace.id, Number(memberMatch[1]));
      } else {
        const form = await request.formData();
        const role = parseRole(form.get("role"));
        if (!role) return new Response("Invalid role", { status: 422 });
        store.updateMemberRole(
          user.id,
          workspace.id,
          Number(memberMatch[1]),
          role,
        );
      }
      return redirect("/settings/members");
    } catch (error) {
      return html(
        renderMembers(
          user,
          workspace,
          store.listMembers(user.id, workspace.id),
          undefined,
          (error as Error).message,
        ),
        409,
      );
    }
  }

  if (request.method === "GET" && url.pathname === "/api/search") {
    const user = await currentUser(request, store);
    if (!user) return Response.json({ results: [] }, { status: 401 });
    const query = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
    return Response.json({
      results: query ? store.search(user.id, query) : [],
    });
  }

  if (request.method === "GET" && url.pathname === "/search") {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.getWorkspaceOverview(user.id);
    const query = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
    return html(
      renderSearch(
        user,
        workspace,
        query,
        query ? store.search(user.id, query) : [],
      ),
    );
  }

  const revisionsMatch = url.pathname.match(/^\/pages\/(\d+)\/revisions$/);
  if (request.method === "GET" && revisionsMatch) {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const pageId = Number(revisionsMatch[1]);
    const document = store.getPageForUser(pageId, user.id);
    if (!document) return new Response("Not found", { status: 404 });
    return html(
      renderRevisions(
        user,
        store.getWorkspaceOverview(user.id),
        document,
        store.listRevisions(user.id, pageId),
      ),
    );
  }

  const restoreMatch = url.pathname.match(
    /^\/pages\/(\d+)\/revisions\/(\d+)\/restore$/,
  );
  if (request.method === "POST" && restoreMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    try {
      store.restoreRevision(
        user.id,
        Number(restoreMatch[1]),
        Number(restoreMatch[2]),
      );
      return redirect(`/pages/${restoreMatch[1]}`);
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const shareMatch = url.pathname.match(/^\/pages\/(\d+)\/share$/);
  if (request.method === "POST" && shareMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const pageId = Number(shareMatch[1]);
    const document = store.getPageForUser(pageId, user.id);
    if (!document) return new Response("Not found", { status: 404 });
    const token = await store.createShareToken(user.id, pageId);
    return html(
      renderShareCreated(document, `${url.origin}/shared/${token}`),
    );
  }

  const revokeShareMatch = url.pathname.match(
    /^\/pages\/(\d+)\/share\/revoke$/,
  );
  if (request.method === "POST" && revokeShareMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    try {
      store.revokeShareTokens(user.id, Number(revokeShareMatch[1]));
      return redirect(`/pages/${revokeShareMatch[1]}`);
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const uploadMatch = url.pathname.match(/^\/pages\/(\d+)\/assets$/);
  if (request.method === "GET" && uploadMatch) {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const pageId = Number(uploadMatch[1]);
    const document = store.getPageForUser(pageId, user.id);
    if (!document) return new Response("Not found", { status: 404 });
    return html(
      renderAssets(
        user,
        store.getWorkspaceOverview(user.id),
        document,
        store.listAssets(user.id, pageId),
      ),
    );
  }
  if (request.method === "POST" && uploadMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const pageId = Number(uploadMatch[1]);
    const document = store.getPageForUser(pageId, user.id);
    if (!document) return new Response("Not found", { status: 404 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return new Response("Choose a file", { status: 422 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return new Response("Files are limited to 10 MB", { status: 413 });
    }
    const mimeType = allowedMimeType(file.type);
    if (!mimeType) {
      return new Response("File type is not allowed", { status: 415 });
    }
    const storageName = crypto.randomUUID();
    await Deno.mkdir(`${runtime.dataDirectory}/assets`, { recursive: true });
    await Deno.writeFile(
      `${runtime.dataDirectory}/assets/${storageName}`,
      new Uint8Array(await file.arrayBuffer()),
      { createNew: true },
    );
    const assetId = store.createAsset({
      userId: user.id,
      pageId,
      storageName,
      originalName: file.name,
      mimeType,
      size: file.size,
    });
    const assetUrl = `/files/${assetId}/${encodeURIComponent(file.name)}`;
    if (request.headers.get("accept")?.includes("application/json")) {
      return Response.json({
        url: assetUrl,
        name: file.name,
        image: mimeType.startsWith("image/"),
      });
    }
    return html(
      renderAssetCreated(document, assetUrl, mimeType.startsWith("image/")),
    );
  }

  const deleteAssetMatch = url.pathname.match(/^\/assets\/(\d+)\/delete$/);
  if (request.method === "POST" && deleteAssetMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    try {
      const storageName = store.deleteAsset(
        user.id,
        Number(deleteAssetMatch[1]),
      );
      try {
        await Deno.remove(`${runtime.dataDirectory}/assets/${storageName}`);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) throw error;
      }
      return redirect("/");
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const deletePageMatch = url.pathname.match(/^\/pages\/(\d+)\/delete$/);
  if (request.method === "POST" && deletePageMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    try {
      const storageNames = store.deletePage(
        user.id,
        Number(deletePageMatch[1]),
      );
      await removeAssetFiles(runtime.dataDirectory, storageNames);
      return redirect(firstPageUrl(store.getWorkspaceOverview(user.id)));
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const pageMatch = url.pathname.match(/^\/pages\/(\d+)(\/edit)?$/);
  if (pageMatch) {
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const pageId = Number(pageMatch[1]);
    const document = store.getPageForUser(pageId, user.id);
    if (!document) return new Response("Not found", { status: 404 });
    const workspace = store.getWorkspaceOverview(user.id);

    if (request.method === "GET") {
      const editing = pageMatch[2] === "/edit";
      if (editing && !store.canEditWorkspace(user.id, document.workspaceId)) {
        return new Response("Forbidden", { status: 403 });
      }
      return html(renderEditor(user, workspace, document, editing));
    }

    if (request.method === "POST" && !pageMatch[2]) {
      if (!isSameOrigin(request)) {
        return new Response("Invalid origin", { status: 403 });
      }
      const form = await request.formData();
      const title = String(form.get("title") ?? "").trim();
      const body = String(form.get("body") ?? "");
      const visibility = parseVisibility(form.get("visibility"));
      const workspaceVisibility = parseVisibility(
        form.get("workspaceVisibility"),
      );
      const bookVisibility = parseVisibility(form.get("bookVisibility"));
      if (
        !title || !body || !visibility || !workspaceVisibility ||
        !bookVisibility
      ) {
        return html(
          renderEditor(
            user,
            workspace,
            { ...document, title, body },
            true,
            "A title, Markdown body, and valid visibility are required.",
          ),
          422,
        );
      }
      store.updatePage(
        user.id,
        pageId,
        { title, body, visibility },
        { workspaceVisibility, bookVisibility },
      );
      return redirect(`/pages/${pageId}`);
    }
  }

  if (request.method === "POST" && url.pathname === "/books") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const workspace = store.getWorkspaceOverview(user.id);
    const bookId = store.createBook(
      user.id,
      workspace.id,
      "Untitled book",
      workspace.visibility,
    );
    const pageId = store.createPage(
      user.id,
      bookId,
      "Untitled page",
      workspace.visibility,
    );
    return redirect(`/pages/${pageId}/edit`);
  }

  const deleteBookMatch = url.pathname.match(/^\/books\/(\d+)\/delete$/);
  if (request.method === "POST" && deleteBookMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    try {
      const storageNames = store.deleteBook(
        user.id,
        Number(deleteBookMatch[1]),
      );
      await removeAssetFiles(runtime.dataDirectory, storageNames);
      return redirect(firstPageUrl(store.getWorkspaceOverview(user.id)));
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const bookAppearanceMatch = url.pathname.match(
    /^\/books\/(\d+)\/appearance$/,
  );
  if (request.method === "POST" && bookAppearanceMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const form = await request.formData();
    try {
      store.updateBookAppearance(
        user.id,
        Number(bookAppearanceMatch[1]),
        String(form.get("color") ?? ""),
        String(form.get("icon") ?? ""),
      );
    } catch (error) {
      return new Response((error as Error).message, { status: 422 });
    }
    const returnTo = Number(form.get("returnTo"));
    const page = Number.isSafeInteger(returnTo)
      ? store.getPageForUser(returnTo, user.id)
      : null;
    return redirect(page ? `/pages/${returnTo}` : "/");
  }

  const renameBookMatch = url.pathname.match(/^\/books\/(\d+)$/);
  if (request.method === "POST" && renameBookMatch) {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    try {
      store.renameBook(user.id, Number(renameBookMatch[1]), title);
    } catch (error) {
      return new Response((error as Error).message, { status: 422 });
    }
    if (request.headers.get("accept")?.includes("application/json")) {
      return Response.json({ title });
    }
    const returnTo = Number(form.get("returnTo"));
    const page = Number.isSafeInteger(returnTo)
      ? store.getPageForUser(returnTo, user.id)
      : null;
    return redirect(page ? `/pages/${returnTo}` : "/");
  }

  if (request.method === "POST" && url.pathname === "/pages") {
    if (!isSameOrigin(request)) {
      return new Response("Invalid origin", { status: 403 });
    }
    const user = await currentUser(request, store);
    if (!user) return redirect("/login");
    const form = await request.formData();
    const bookId = Number(form.get("bookId"));
    const visibility = parseVisibility(form.get("visibility")) ?? "private";
    if (!Number.isSafeInteger(bookId)) {
      return new Response("Invalid book", { status: 422 });
    }
    const pageId = store.createPage(
      user.id,
      bookId,
      "Untitled page",
      visibility,
    );
    return redirect(`/pages/${pageId}/edit`);
  }

  return new Response("Not found", { status: 404 });
}

function firstPageUrl(
  workspace: ReturnType<AtriumStore["getWorkspaceOverview"]>,
): string {
  const page = workspace.books.find((book) => book.pages.length)?.pages[0];
  return page ? `/pages/${page.id}` : "/";
}

async function removeAssetFiles(
  dataDirectory: string,
  storageNames: string[],
): Promise<void> {
  for (const storageName of storageNames) {
    try {
      await Deno.remove(`${dataDirectory}/assets/${storageName}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }
}

async function completeSetup(
  request: Request,
  store: AtriumStore,
  secureCookies = false,
): Promise<Response> {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const workspace = String(form.get("workspace") ?? "").trim();

  if (!name || !email.includes("@") || !workspace || password.length < 12) {
    return html(
      renderAuth(
        "setup",
        "Complete every field and use at least 12 characters.",
      ),
      422,
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = store.setupOwner({ name, email, passwordHash, workspace });
    const token = await store.createSession(user.id);
    return redirect("/", {
      "set-cookie": createSessionCookie(token, secureCookies),
    });
  } catch (error) {
    return html(renderAuth("setup", (error as Error).message), 409);
  }
}

async function login(
  request: Request,
  store: AtriumStore,
  secureCookies = false,
  oidcEnabled = false,
): Promise<Response> {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? ""));
  const user = store.findUserByEmail(email);
  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? await dummyPasswordHash,
  );

  if (store.isLoginBlocked(email) || !user || !passwordMatches) {
    store.recordLoginFailure(email);
    return html(
      renderAuth(
        "login",
        "Email or password is incorrect.",
        oidcEnabled,
        returnTo,
        email,
      ),
      401,
    );
  }
  store.clearLoginFailures(email);

  if (user.mfaEnabled && user.mfaSecret) {
    return html(
      renderMfaChallenge(
        await store.createMfaChallenge(user.id),
        undefined,
        returnTo,
      ),
    );
  }

  const token = await store.createSession(user.id);
  return redirect(returnTo || "/", {
    "set-cookie": createSessionCookie(token, secureCookies),
  });
}

async function currentUser(request: Request, store: AtriumStore) {
  const token = readSessionToken(request);
  return token ? await store.findUserBySession(token) : null;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const expected = requestRuntime.get(request)?.baseUrl ??
    new URL(request.url).origin;
  return origin !== null && origin === new URL(expected).origin;
}

function parseVisibility(value: FormDataEntryValue | null) {
  return value === "public" || value === "unlisted" || value === "private"
    ? value
    : null;
}

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  try {
    const parsed = new URL(value, "http://atrium.local");
    return parsed.origin === "http://atrium.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "";
  } catch {
    return "";
  }
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-security-policy":
        "default-src 'self'; style-src 'self' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "permissions-policy":
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
      "referrer-policy": "same-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  });
}

function json(value: unknown): Response {
  return Response.json(value, {
    headers: { "cache-control": "no-store" },
  });
}

function redirect(location: string, headers: HeadersInit = {}): Response {
  return new Response(null, {
    status: 303,
    headers: { ...headers, location },
  });
}

export function startAtrium(options: AtriumOptions = {}): Deno.HttpServer {
  const app = createApp(options);
  const { hostname, port } = app.config;

  console.log(`Atrium is ready at http://${hostname}:${port}`);
  return Deno.serve({ hostname, port }, app.handler);
}

function parseRole(value: FormDataEntryValue | null) {
  return value === "owner" || value === "editor" || value === "reader"
    ? value
    : null;
}

function allowedMimeType(value: string): string | null {
  const allowed = new Set([
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
  ]);
  return allowed.has(value) ? value : null;
}

function safeHeaderFilename(value: string): string {
  return value.replace(/[\r\n"\\]/g, "_").slice(0, 180);
}
