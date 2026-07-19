import {
  assertEquals,
  assertMatch,
  assertRejects,
  assertThrows,
} from "jsr:@std/assert@1";
import { handleRequest } from "./server.ts";
import { AtriumStore } from "./store.ts";
import { renderMarkdown } from "./renderer.ts";
import { createTotpCode, hashPassword, verifyTotpCode } from "./auth.ts";
import { backupAtrium } from "./backup.ts";

Deno.test("health endpoint reports readiness", async () => {
  using store = testStore();
  const response = await handleRequest(
    new Request("http://atrium.test/health"),
    store,
  );

  assertEquals(response.status, 200);
  assertEquals(await response.json(), { status: "ok" });
});

Deno.test("first run creates a private workspace and signs in owner", async () => {
  using store = testStore();
  const body = new URLSearchParams({
    name: "Ada Lovelace",
    workspace: "Analytical Engine",
    email: "ada@example.com",
    password: "a-secure-password",
  });
  const response = await handleRequest(
    new Request("http://atrium.test/setup", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "http://atrium.test",
      },
      body,
    }),
    store,
  );

  assertEquals(response.status, 303);
  assertEquals(response.headers.get("location"), "/");
  assertMatch(response.headers.get("set-cookie") ?? "", /HttpOnly/);
  assertEquals(store.isConfigured(), true);

  const owner = store.findUserByEmail("ada@example.com");
  const overview = store.getWorkspaceOverview(owner!.id);
  assertEquals(overview.visibility, "private");
  assertEquals(overview.role, "owner");
  assertEquals(overview.books[0].pages[0].visibility, "private");
});

Deno.test("cross-origin mutations are rejected", async () => {
  using store = testStore();
  const response = await handleRequest(
    new Request("http://atrium.test/setup", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
      body: new URLSearchParams(),
    }),
    store,
  );

  assertEquals(response.status, 403);
});

Deno.test("unknown routes return 404", async () => {
  using store = testStore();
  const response = await handleRequest(
    new Request("http://atrium.test/missing"),
    store,
  );

  assertEquals(response.status, 404);
});

Deno.test("owner can edit a page and each save creates a revision", async () => {
  using store = testStore();
  const owner = store.setupOwner({
    name: "Ada Lovelace",
    workspace: "Analytical Engine",
    email: "ada@example.com",
    passwordHash: "test-only",
  });
  const page = store.getWorkspaceOverview(owner.id).books[0].pages[0];

  store.updatePage(owner.id, page.id, {
    title: "Operating notes",
    body: "# Operating notes\n\nUse **carefully**.",
    visibility: "public",
  });

  const updated = store.getPageForUser(page.id, owner.id);
  assertEquals(updated?.title, "Operating notes");
  assertEquals(updated?.visibility, "public");
  assertEquals(store.revisionCount(page.id), 1);
});

Deno.test("book renames preserve the stable public slug", () => {
  using store = testStore();
  const owner = store.setupOwner({
    name: "Ada Lovelace",
    workspace: "Analytical Engine",
    email: "ada@example.com",
    passwordHash: "test-only",
  });
  const before = store.getWorkspaceOverview(owner.id).books[0];

  store.renameBook(owner.id, before.id, "Operations handbook");

  const after = store.getWorkspaceOverview(owner.id).books[0];
  assertEquals(after.title, "Operations handbook");
  const page = store.getPageForUser(after.pages[0].id, owner.id);
  assertEquals(page?.bookSlug, "welcome");
});

Deno.test("editors can delete pages and their stored assets", () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const pageId = workspace.books[0].pages[0].id;
  store.createAsset({
    userId: owner.id,
    pageId,
    storageName: "page-asset",
    originalName: "diagram.png",
    mimeType: "image/png",
    size: 10,
  });

  assertEquals(store.deletePage(owner.id, pageId), ["page-asset"]);
  assertEquals(store.getPageForUser(pageId, owner.id), null);
  assertEquals(store.getAsset(1), null);
});

Deno.test("deleting a book removes all of its pages and assets", () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const book = workspace.books[0];
  const secondPageId = store.createPage(
    owner.id,
    book.id,
    "Second page",
    "private",
  );
  store.createAsset({
    userId: owner.id,
    pageId: secondPageId,
    storageName: "book-asset",
    originalName: "notes.txt",
    mimeType: "text/plain",
    size: 10,
  });

  assertEquals(store.deleteBook(owner.id, book.id), ["book-asset"]);
  assertEquals(store.getWorkspaceOverview(owner.id).books, []);
  assertEquals(store.getPageForUser(secondPageId, owner.id), null);
});

Deno.test("Markdown preview is rendered through the Steno template core", () => {
  const output = renderMarkdown("# Hello\n\nThis is **Atrium**.");

  assertMatch(output, /<h1>Hello<\/h1>/);
  assertMatch(output, /<strong>Atrium<\/strong>/);
  assertMatch(output, /class="rendered-markdown"/);
});

Deno.test("rendered Markdown removes executable HTML", () => {
  const output = renderMarkdown(
    '# Safe\n\n<script>alert("no")</script><a href="javascript:alert(1)">link</a>',
  );

  assertEquals(output.includes("<script"), false);
  assertEquals(output.includes("javascript:"), false);
});

Deno.test("public delivery requires public visibility at every level", async () => {
  using store = testStore();
  const owner = store.setupOwner({
    name: "Ada Lovelace",
    workspace: "Analytical Engine",
    email: "ada@example.com",
    passwordHash: "test-only",
  });
  const pageSummary = store.getWorkspaceOverview(owner.id).books[0].pages[0];
  const initial = store.getPageForUser(pageSummary.id, owner.id)!;
  const publicUrl =
    `http://atrium.test/s/${initial.workspaceSlug}/${initial.bookSlug}/${initial.slug}`;

  const hidden = await handleRequest(new Request(publicUrl), store);
  assertEquals(hidden.status, 404);

  store.updatePage(
    owner.id,
    initial.id,
    { title: initial.title, body: initial.body, visibility: "public" },
    { workspaceVisibility: "public", bookVisibility: "public" },
  );
  const visible = await handleRequest(new Request(publicUrl), store);
  assertEquals(visible.status, 200);
  assertMatch(await visible.text(), /Welcome to Atrium/);
});

Deno.test("owner invitations create a reader membership without storing raw token", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const token = await store.createInvitation(
    owner.id,
    workspace.id,
    "grace@example.com",
    "reader",
  );
  const invitation = await store.getInvitation(token);
  assertEquals(invitation?.role, "reader");

  const invited = await store.acceptInvitation(token, {
    name: "Grace Hopper",
    passwordHash: "test-only",
  });
  assertEquals(store.getWorkspaceOverview(invited.id).role, "reader");
  assertEquals(await store.getInvitation(token), null);
  await assertRejects(() =>
    store.createInvitation(
      invited.id,
      workspace.id,
      "other@example.com",
      "reader",
    )
  );
});

Deno.test("reader cannot edit pages or create unlisted shares", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const token = await store.createInvitation(
    owner.id,
    workspace.id,
    "reader@example.com",
    "reader",
  );
  const reader = await store.acceptInvitation(token, {
    name: "Reader",
    passwordHash: "test-only",
  });
  const pageId = workspace.books[0].pages[0].id;

  assertThrows(() =>
    store.updatePage(reader.id, pageId, {
      title: "Changed",
      body: "No",
      visibility: "private",
    })
  );
  await assertRejects(() => store.createShareToken(reader.id, pageId));
});

Deno.test("revision history can restore a previous page safely", () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const pageId = store.getWorkspaceOverview(owner.id).books[0].pages[0].id;
  store.updatePage(owner.id, pageId, {
    title: "Second",
    body: "# Second",
    visibility: "private",
  });
  const revision = store.listRevisions(owner.id, pageId)[0];
  store.restoreRevision(owner.id, pageId, revision.id);

  assertEquals(
    store.getPageForUser(pageId, owner.id)?.title,
    "Welcome to Atrium",
  );
  assertEquals(store.revisionCount(pageId), 2);
});

Deno.test("search only returns pages in the user's workspaces", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const token = await store.createInvitation(
    owner.id,
    workspace.id,
    "search@example.com",
    "reader",
  );
  const reader = await store.acceptInvitation(token, {
    name: "Search Reader",
    passwordHash: "test-only",
  });

  const results = store.search(reader.id, "private page");
  assertEquals(results.length, 1);
  assertEquals(results[0].title, "Welcome to Atrium");
});

Deno.test("unlisted share tokens can be revoked", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const pageId = store.getWorkspaceOverview(owner.id).books[0].pages[0].id;
  const token = await store.createShareToken(owner.id, pageId);

  assertEquals((await store.getSharedPage(token))?.id, pageId);
  store.revokeShareTokens(owner.id, pageId);
  assertEquals(await store.getSharedPage(token), null);
});

Deno.test("TOTP accepts the current window and rejects incorrect codes", async () => {
  const secret = "JBSWY3DPEHPK3PXP";
  const timestamp = 1_700_000_000_000;
  const code = await createTotpCode(secret, timestamp);

  assertEquals(await verifyTotpCode(secret, code, timestamp), true);
  assertEquals(await verifyTotpCode(secret, "000000", timestamp), false);
});

Deno.test("MFA recovery codes are hashed and single-use", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const codes = await store.createMfaRecoveryCodes(owner.id);

  assertEquals(codes.length, 8);
  assertEquals(await store.consumeMfaRecoveryCode(owner.id, codes[0]), true);
  assertEquals(await store.consumeMfaRecoveryCode(owner.id, codes[0]), false);
  assertEquals(
    await store.consumeMfaRecoveryCode(owner.id, "WRONG-CODE"),
    false,
  );
});

Deno.test("password recovery is single-use and revokes active sessions", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const session = await store.createSession(owner.id);
  const reset = await store.createPasswordReset(owner.email);
  const changed = await store.resetPassword(
    reset!,
    await hashPassword("a-new-secure-password"),
  );

  assertEquals(changed, true);
  assertEquals(await store.findUserBySession(session), null);
  assertEquals(await store.resetPassword(reset!, "another"), false);
});

Deno.test("backup includes database, assets, and manifest", async () => {
  const dataDirectory = await Deno.makeTempDir({ prefix: "atrium-data-" });
  const destination = await Deno.makeTempDir({ prefix: "atrium-backup-" });
  try {
    const store = new AtriumStore(`${dataDirectory}/atrium.db`);
    setupTestOwner(store);
    store.close();
    await Deno.mkdir(`${dataDirectory}/assets`);
    await Deno.writeTextFile(`${dataDirectory}/assets/example`, "asset");

    const backup = await backupAtrium(dataDirectory, destination);
    assertEquals((await Deno.stat(`${backup}/atrium.db`)).isFile, true);
    assertEquals((await Deno.stat(`${backup}/assets/example`)).isFile, true);
    assertEquals((await Deno.stat(`${backup}/backup.json`)).isFile, true);
  } finally {
    await Deno.remove(dataDirectory, { recursive: true });
    await Deno.remove(destination, { recursive: true });
  }
});

Deno.test("existing users can accept matching-email invitations", async () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const workspace = store.getWorkspaceOverview(owner.id);
  const secondToken = await store.createInvitation(
    owner.id,
    workspace.id,
    "existing@example.com",
    "reader",
  );
  const existing = await store.acceptInvitation(secondToken, {
    name: "Existing",
    passwordHash: "test-only",
  });
  store.removeMember(owner.id, workspace.id, existing.id);

  const inviteAgain = await store.createInvitation(
    owner.id,
    workspace.id,
    "existing@example.com",
    "editor",
  );
  await store.acceptInvitationForUser(inviteAgain, existing.id);
  assertEquals(store.getWorkspaceOverview(existing.id).role, "editor");
});

Deno.test("login failures are rate limited and clear after success", () => {
  using store = testStore();
  setupTestOwner(store);
  for (let attempt = 0; attempt < 8; attempt++) {
    store.recordLoginFailure("ada@example.com");
  }
  assertEquals(store.isLoginBlocked("ada@example.com"), true);
  store.clearLoginFailures("ada@example.com");
  assertEquals(store.isLoginBlocked("ada@example.com"), false);
});

Deno.test("assets follow page visibility and membership permissions", () => {
  using store = testStore();
  const owner = setupTestOwner(store);
  const pageId = store.getWorkspaceOverview(owner.id).books[0].pages[0].id;
  const assetId = store.createAsset({
    userId: owner.id,
    pageId,
    storageName: "stored",
    originalName: "diagram.png",
    mimeType: "image/png",
    size: 42,
  });

  assertEquals(store.canReadAsset(owner.id, assetId), true);
  assertEquals(store.canReadAsset(null, assetId), false);
  const page = store.getPageForUser(pageId, owner.id)!;
  store.updatePage(
    owner.id,
    pageId,
    { title: page.title, body: page.body, visibility: "public" },
    { workspaceVisibility: "public", bookVisibility: "public" },
  );
  assertEquals(store.canReadAsset(null, assetId), true);
  assertEquals(store.deleteAsset(owner.id, assetId), "stored");
  assertEquals(store.getAsset(assetId), null);
});

Deno.test("same-origin protection rejects mutations without Origin", async () => {
  using store = testStore();
  const response = await handleRequest(
    new Request("http://atrium.test/setup", {
      method: "POST",
      body: new URLSearchParams(),
    }),
    store,
  );
  assertEquals(response.status, 403);
});

Deno.test("image Markdown remains available after sanitization", () => {
  const output = renderMarkdown("![Diagram](/files/1/diagram.png)");
  assertMatch(output, /<img src="\/files\/1\/diagram.png" alt="Diagram"/);
});

function testStore(): AtriumStore & Disposable {
  const store = new AtriumStore(":memory:") as AtriumStore & Disposable;
  store[Symbol.dispose] = () => store.close();
  return store;
}

function setupTestOwner(store: AtriumStore) {
  return store.setupOwner({
    name: "Ada Lovelace",
    workspace: "Analytical Engine",
    email: "ada@example.com",
    passwordHash: "test-only",
  });
}
