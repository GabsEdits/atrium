import { DatabaseSync } from "node:sqlite";
import { createSessionToken, hashSessionToken } from "./auth.ts";
import type { ContentVisibility, Role } from "./types.ts";

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  mfaSecret: string | null;
  mfaEnabled: boolean;
};

export type WorkspaceOverview = {
  id: number;
  name: string;
  visibility: ContentVisibility;
  role: Role;
  books: Array<{
    id: number;
    title: string;
    visibility: ContentVisibility;
    pages: Array<{ id: number; title: string; visibility: ContentVisibility }>;
  }>;
};

export type PageDetail = {
  id: number;
  bookId: number;
  workspaceId: number;
  workspaceSlug: string;
  workspaceVisibility: ContentVisibility;
  bookTitle: string;
  bookSlug: string;
  bookVisibility: ContentVisibility;
  title: string;
  slug: string;
  body: string;
  visibility: ContentVisibility;
  updatedAt: string;
};

export type Member = {
  userId: number;
  name: string;
  email: string;
  role: Role;
};

export type PageRevision = {
  id: number;
  authorName: string;
  title: string;
  visibility: ContentVisibility;
  createdAt: string;
};

export type SearchResult = {
  pageId: number;
  title: string;
  excerpt: string;
  bookTitle: string;
};

export class AtriumStore {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
    this.#migrate();
  }

  close(): void {
    this.#database.close();
  }

  checkpoint(): void {
    this.#database.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  }

  isConfigured(): boolean {
    const row = this.#database.prepare("SELECT COUNT(*) AS count FROM users")
      .get() as {
        count: number;
      };
    return Number(row.count) > 0;
  }

  setupOwner(input: {
    name: string;
    email: string;
    passwordHash: string;
    workspace: string;
  }): User {
    if (this.isConfigured()) throw new Error("Atrium is already configured.");

    this.#database.exec("BEGIN IMMEDIATE");
    try {
      const userResult = this.#database.prepare(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      ).run(input.name, input.email, input.passwordHash);
      const userId = Number(userResult.lastInsertRowid);
      const workspaceResult = this.#database.prepare(
        "INSERT INTO workspaces (name, slug, visibility) VALUES (?, ?, 'private')",
      ).run(input.workspace, uniqueSlug(input.workspace));
      const workspaceId = Number(workspaceResult.lastInsertRowid);

      this.#database.prepare(
        "INSERT INTO memberships (user_id, workspace_id, role) VALUES (?, ?, 'owner')",
      ).run(userId, workspaceId);
      const bookResult = this.#database.prepare(
        "INSERT INTO books (workspace_id, title, slug, visibility) VALUES (?, 'Welcome', 'welcome', 'private')",
      ).run(workspaceId);
      this.#database.prepare(
        `INSERT INTO pages (book_id, title, slug, body, visibility)
         VALUES (?, 'Welcome to Atrium', 'welcome', ?, 'private')`,
      ).run(
        Number(bookResult.lastInsertRowid),
        "# Welcome to Atrium\n\nThis private page is ready for your team's knowledge.",
      );
      this.#database.exec("COMMIT");
      return {
        id: userId,
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        mfaSecret: null,
        mfaEnabled: false,
      };
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  findUserByEmail(email: string): User | null {
    const row = this.#database.prepare(
      `SELECT id, name, email, password_hash, mfa_secret, mfa_enabled
       FROM users WHERE email = ?`,
    ).get(email) as Record<string, unknown> | undefined;
    return row ? mapUser(row) : null;
  }

  isLoginBlocked(email: string): boolean {
    const row = this.#database.prepare(
      `SELECT COUNT(*) AS count FROM auth_attempts
       WHERE email = ? AND attempted_at > datetime('now', '-15 minutes')`,
    ).get(email) as { count: number };
    return Number(row.count) >= 8;
  }

  recordLoginFailure(email: string): void {
    this.#database.prepare("INSERT INTO auth_attempts (email) VALUES (?)").run(
      email,
    );
  }

  clearLoginFailures(email: string): void {
    this.#database.prepare("DELETE FROM auth_attempts WHERE email = ?").run(
      email,
    );
  }

  async createSession(userId: number): Promise<string> {
    const token = createSessionToken();
    const tokenHash = await hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString();
    this.#database.prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    ).run(tokenHash, userId, expiresAt);
    return token;
  }

  async findUserBySession(token: string): Promise<User | null> {
    const tokenHash = await hashSessionToken(token);
    const row = this.#database.prepare(
      `SELECT users.id, users.name, users.email, users.password_hash,
              users.mfa_secret, users.mfa_enabled
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    ).get(tokenHash, new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    return row ? mapUser(row) : null;
  }

  async deleteSession(token: string): Promise<void> {
    this.#database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(
      await hashSessionToken(token),
    );
  }

  getWorkspaceOverview(userId: number): WorkspaceOverview {
    const workspace = this.#database.prepare(
      `SELECT workspaces.id, workspaces.name, workspaces.visibility, memberships.role
       FROM workspaces
       JOIN memberships ON memberships.workspace_id = workspaces.id
       WHERE memberships.user_id = ?
       ORDER BY workspaces.id
       LIMIT 1`,
    ).get(userId) as Record<string, unknown> | undefined;

    if (!workspace) throw new Error("User has no workspace.");
    const workspaceId = Number(workspace.id);
    const books = this.#database.prepare(
      "SELECT id, title, visibility FROM books WHERE workspace_id = ? ORDER BY position, id",
    ).all(workspaceId) as Array<Record<string, unknown>>;

    return {
      id: workspaceId,
      name: String(workspace.name),
      visibility: workspace.visibility as ContentVisibility,
      role: workspace.role as Role,
      books: books.map((book) => ({
        id: Number(book.id),
        title: String(book.title),
        visibility: book.visibility as ContentVisibility,
        pages: (this.#database.prepare(
          "SELECT id, title, visibility FROM pages WHERE book_id = ? ORDER BY position, id",
        ).all(Number(book.id)) as Array<Record<string, unknown>>).map((
          page,
        ) => ({
          id: Number(page.id),
          title: String(page.title),
          visibility: page.visibility as ContentVisibility,
        })),
      })),
    };
  }

  getPageForUser(pageId: number, userId: number): PageDetail | null {
    const row = this.#database.prepare(
      `SELECT pages.id, pages.book_id, books.workspace_id,
              workspaces.slug AS workspace_slug,
              workspaces.visibility AS workspace_visibility,
              books.title AS book_title, books.slug AS book_slug,
              books.visibility AS book_visibility,
              pages.title, pages.slug, pages.body, pages.visibility, pages.updated_at
       FROM pages
       JOIN books ON books.id = pages.book_id
       JOIN workspaces ON workspaces.id = books.workspace_id
       JOIN memberships ON memberships.workspace_id = books.workspace_id
       WHERE pages.id = ? AND memberships.user_id = ?`,
    ).get(pageId, userId) as Record<string, unknown> | undefined;
    return row ? mapPage(row) : null;
  }

  getPublicPage(
    workspaceSlug: string,
    bookSlug: string,
    pageSlug: string,
  ): PageDetail | null {
    const row = this.#database.prepare(
      `SELECT pages.id, pages.book_id, books.workspace_id,
              workspaces.slug AS workspace_slug,
              workspaces.visibility AS workspace_visibility,
              books.title AS book_title, books.slug AS book_slug,
              books.visibility AS book_visibility,
              pages.title, pages.slug, pages.body, pages.visibility, pages.updated_at
       FROM pages
       JOIN books ON books.id = pages.book_id
       JOIN workspaces ON workspaces.id = books.workspace_id
       WHERE workspaces.slug = ? AND books.slug = ? AND pages.slug = ?
         AND workspaces.visibility = 'public'
         AND books.visibility = 'public'
         AND pages.visibility = 'public'`,
    ).get(workspaceSlug, bookSlug, pageSlug) as
      | Record<string, unknown>
      | undefined;
    return row ? mapPage(row) : null;
  }

  canEditWorkspace(userId: number, workspaceId: number): boolean {
    const row = this.#database.prepare(
      `SELECT role FROM memberships
       WHERE user_id = ? AND workspace_id = ? AND role IN ('owner', 'editor')`,
    ).get(userId, workspaceId);
    return row !== undefined;
  }

  createBook(
    userId: number,
    workspaceId: number,
    title: string,
    visibility: ContentVisibility,
  ): number {
    this.#assertCanEdit(userId, workspaceId);
    const result = this.#database.prepare(
      "INSERT INTO books (workspace_id, title, slug, visibility) VALUES (?, ?, ?, ?)",
    ).run(workspaceId, title, uniqueSlug(title), visibility);
    return Number(result.lastInsertRowid);
  }

  renameBook(userId: number, bookId: number, title: string): void {
    const book = this.#database.prepare(
      "SELECT workspace_id FROM books WHERE id = ?",
    ).get(bookId) as Record<string, unknown> | undefined;
    if (!book) throw new Error("Book not found.");
    this.#assertCanEdit(userId, Number(book.workspace_id));
    const normalizedTitle = title.trim();
    if (!normalizedTitle || normalizedTitle.length > 120) {
      throw new Error("Book names must be between 1 and 120 characters.");
    }
    this.#database.prepare(
      "UPDATE books SET title = ? WHERE id = ?",
    ).run(normalizedTitle, bookId);
  }

  deleteBook(userId: number, bookId: number): string[] {
    const book = this.#database.prepare(
      "SELECT workspace_id FROM books WHERE id = ?",
    ).get(bookId) as Record<string, unknown> | undefined;
    if (!book) throw new Error("Book not found.");
    this.#assertCanEdit(userId, Number(book.workspace_id));
    const assets = this.#database.prepare(
      `SELECT assets.storage_name FROM assets
       JOIN pages ON pages.id = assets.page_id
       WHERE pages.book_id = ?`,
    ).all(bookId) as Array<Record<string, unknown>>;
    this.#database.prepare("DELETE FROM books WHERE id = ?").run(bookId);
    return assets.map((asset) => String(asset.storage_name));
  }

  createPage(
    userId: number,
    bookId: number,
    title: string,
    visibility: ContentVisibility,
  ): number {
    const book = this.#database.prepare(
      "SELECT workspace_id FROM books WHERE id = ?",
    ).get(bookId) as Record<string, unknown> | undefined;
    if (!book) throw new Error("Book not found.");
    this.#assertCanEdit(userId, Number(book.workspace_id));
    const result = this.#database.prepare(
      `INSERT INTO pages (book_id, title, slug, body, visibility)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(
      bookId,
      title,
      uniqueSlug(title),
      `# ${title}\n\nStart writing here.`,
      visibility,
    );
    return Number(result.lastInsertRowid);
  }

  deletePage(userId: number, pageId: number): string[] {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(userId, page.workspaceId);
    const assets = this.#database.prepare(
      "SELECT storage_name FROM assets WHERE page_id = ?",
    ).all(pageId) as Array<Record<string, unknown>>;
    this.#database.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
    return assets.map((asset) => String(asset.storage_name));
  }

  updatePage(
    userId: number,
    pageId: number,
    input: { title: string; body: string; visibility: ContentVisibility },
    hierarchy?: {
      workspaceVisibility: ContentVisibility;
      bookVisibility: ContentVisibility;
    },
  ): void {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(userId, page.workspaceId);

    this.#database.exec("BEGIN IMMEDIATE");
    try {
      this.#database.prepare(
        `INSERT INTO page_revisions
          (page_id, author_id, title, body, visibility)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(pageId, userId, page.title, page.body, page.visibility);
      this.#database.prepare(
        `UPDATE pages
         SET title = ?, body = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      ).run(input.title, input.body, input.visibility, pageId);
      if (hierarchy) {
        this.#database.prepare(
          "UPDATE workspaces SET visibility = ? WHERE id = ?",
        ).run(hierarchy.workspaceVisibility, page.workspaceId);
        this.#database.prepare(
          "UPDATE books SET visibility = ? WHERE id = ?",
        ).run(hierarchy.bookVisibility, page.bookId);
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  revisionCount(pageId: number): number {
    const row = this.#database.prepare(
      "SELECT COUNT(*) AS count FROM page_revisions WHERE page_id = ?",
    ).get(pageId) as { count: number };
    return Number(row.count);
  }

  listMembers(userId: number, workspaceId: number): Member[] {
    this.#assertMember(userId, workspaceId);
    return (this.#database.prepare(
      `SELECT users.id AS user_id, users.name, users.email, memberships.role
       FROM memberships
       JOIN users ON users.id = memberships.user_id
       WHERE memberships.workspace_id = ?
       ORDER BY CASE memberships.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END,
                users.name`,
    ).all(workspaceId) as Array<Record<string, unknown>>).map((row) => ({
      userId: Number(row.user_id),
      name: String(row.name),
      email: String(row.email),
      role: row.role as Role,
    }));
  }

  async createInvitation(
    userId: number,
    workspaceId: number,
    email: string,
    role: Exclude<Role, "owner">,
  ): Promise<string> {
    this.#assertOwner(userId, workspaceId);
    const token = createSessionToken();
    const tokenHash = await hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString();
    this.#database.prepare(
      `INSERT INTO invitations
        (workspace_id, email, role, token_hash, invited_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(workspaceId, email.toLowerCase(), role, tokenHash, userId, expiresAt);
    return token;
  }

  async getInvitation(token: string): Promise<
    {
      email: string;
      role: Role;
      workspaceId: number;
      workspaceName: string;
    } | null
  > {
    const row = this.#database.prepare(
      `SELECT invitations.email, invitations.role, invitations.workspace_id,
              workspaces.name AS workspace_name
       FROM invitations
       JOIN workspaces ON workspaces.id = invitations.workspace_id
       WHERE invitations.token_hash = ? AND invitations.accepted_at IS NULL
         AND invitations.expires_at > ?`,
    ).get(await hashSessionToken(token), new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    return row
      ? {
        email: String(row.email),
        role: row.role as Role,
        workspaceId: Number(row.workspace_id),
        workspaceName: String(row.workspace_name),
      }
      : null;
  }

  async acceptInvitation(
    token: string,
    input: { name: string; passwordHash: string },
  ): Promise<User> {
    const invitation = await this.getInvitation(token);
    if (!invitation) throw new Error("Invitation is invalid or expired.");
    if (this.findUserByEmail(invitation.email)) {
      throw new Error("This email already has an account. Sign in to accept.");
    }

    const tokenHash = await hashSessionToken(token);
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      const result = this.#database.prepare(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      ).run(input.name, invitation.email, input.passwordHash);
      const userId = Number(result.lastInsertRowid);
      this.#database.prepare(
        "INSERT INTO memberships (user_id, workspace_id, role) VALUES (?, ?, ?)",
      ).run(userId, invitation.workspaceId, invitation.role);
      this.#database.prepare(
        "UPDATE invitations SET accepted_at = CURRENT_TIMESTAMP WHERE token_hash = ?",
      ).run(tokenHash);
      this.#database.exec("COMMIT");
      return {
        id: userId,
        name: input.name,
        email: invitation.email,
        passwordHash: input.passwordHash,
        mfaSecret: null,
        mfaEnabled: false,
      };
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  async acceptInvitationForUser(token: string, userId: number): Promise<void> {
    const invitation = await this.getInvitation(token);
    const user = this.#database.prepare(
      "SELECT email FROM users WHERE id = ?",
    ).get(userId) as Record<string, unknown> | undefined;
    if (
      !invitation || !user ||
      String(user.email).toLowerCase() !== invitation.email.toLowerCase()
    ) {
      throw new Error("Invitation does not match this account.");
    }
    const tokenHash = await hashSessionToken(token);
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      this.#database.prepare(
        `INSERT INTO memberships (user_id, workspace_id, role)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, workspace_id) DO UPDATE SET role = excluded.role`,
      ).run(userId, invitation.workspaceId, invitation.role);
      this.#database.prepare(
        "UPDATE invitations SET accepted_at = CURRENT_TIMESTAMP WHERE token_hash = ?",
      ).run(tokenHash);
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  updateMemberRole(
    ownerId: number,
    workspaceId: number,
    memberId: number,
    role: Role,
  ): void {
    this.#assertOwner(ownerId, workspaceId);
    if (memberId === ownerId && role !== "owner") {
      const ownerCount = this.#ownerCount(workspaceId);
      if (ownerCount <= 1) throw new Error("A workspace must retain an owner.");
    }
    this.#database.prepare(
      "UPDATE memberships SET role = ? WHERE workspace_id = ? AND user_id = ?",
    ).run(role, workspaceId, memberId);
  }

  removeMember(ownerId: number, workspaceId: number, memberId: number): void {
    this.#assertOwner(ownerId, workspaceId);
    const member = this.#database.prepare(
      "SELECT role FROM memberships WHERE workspace_id = ? AND user_id = ?",
    ).get(workspaceId, memberId) as Record<string, unknown> | undefined;
    if (member?.role === "owner" && this.#ownerCount(workspaceId) <= 1) {
      throw new Error("A workspace must retain an owner.");
    }
    this.#database.prepare(
      "DELETE FROM memberships WHERE workspace_id = ? AND user_id = ?",
    ).run(workspaceId, memberId);
  }

  listRevisions(userId: number, pageId: number): PageRevision[] {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    return (this.#database.prepare(
      `SELECT page_revisions.id, page_revisions.title,
              page_revisions.visibility, page_revisions.created_at,
              users.name AS author_name
       FROM page_revisions
       JOIN users ON users.id = page_revisions.author_id
       WHERE page_revisions.page_id = ?
       ORDER BY page_revisions.id DESC`,
    ).all(pageId) as Array<Record<string, unknown>>).map((row) => ({
      id: Number(row.id),
      authorName: String(row.author_name),
      title: String(row.title),
      visibility: row.visibility as ContentVisibility,
      createdAt: String(row.created_at),
    }));
  }

  restoreRevision(userId: number, pageId: number, revisionId: number): void {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(userId, page.workspaceId);
    const revision = this.#database.prepare(
      `SELECT title, body, visibility FROM page_revisions
       WHERE id = ? AND page_id = ?`,
    ).get(revisionId, pageId) as Record<string, unknown> | undefined;
    if (!revision) throw new Error("Revision not found.");
    this.updatePage(userId, pageId, {
      title: String(revision.title),
      body: String(revision.body),
      visibility: revision.visibility as ContentVisibility,
    });
  }

  search(userId: number, query: string): SearchResult[] {
    const pattern = `%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    return (this.#database.prepare(
      `SELECT pages.id AS page_id, pages.title, pages.body,
              books.title AS book_title
       FROM pages
       JOIN books ON books.id = pages.book_id
       JOIN memberships ON memberships.workspace_id = books.workspace_id
       WHERE memberships.user_id = ?
         AND (pages.title LIKE ? ESCAPE '\\' OR pages.body LIKE ? ESCAPE '\\')
       ORDER BY pages.updated_at DESC
       LIMIT 30`,
    ).all(userId, pattern, pattern) as Array<Record<string, unknown>>).map(
      (row) => ({
        pageId: Number(row.page_id),
        title: String(row.title),
        excerpt: excerpt(String(row.body), query),
        bookTitle: String(row.book_title),
      }),
    );
  }

  async createShareToken(userId: number, pageId: number): Promise<string> {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(userId, page.workspaceId);
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString();
    this.#database.prepare(
      `INSERT INTO page_shares (page_id, token_hash, created_by, expires_at)
       VALUES (?, ?, ?, ?)`,
    ).run(pageId, await hashSessionToken(token), userId, expiresAt);
    return token;
  }

  async getSharedPage(token: string): Promise<PageDetail | null> {
    const row = this.#database.prepare(
      `SELECT pages.id, pages.book_id, books.workspace_id,
              workspaces.slug AS workspace_slug,
              workspaces.visibility AS workspace_visibility,
              books.title AS book_title, books.slug AS book_slug,
              books.visibility AS book_visibility,
              pages.title, pages.slug, pages.body, pages.visibility, pages.updated_at
       FROM page_shares
       JOIN pages ON pages.id = page_shares.page_id
       JOIN books ON books.id = pages.book_id
       JOIN workspaces ON workspaces.id = books.workspace_id
       WHERE page_shares.token_hash = ? AND page_shares.revoked_at IS NULL
         AND page_shares.expires_at > ?`,
    ).get(await hashSessionToken(token), new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    return row ? mapPage(row) : null;
  }

  revokeShareTokens(userId: number, pageId: number): void {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(userId, page.workspaceId);
    this.#database.prepare(
      "UPDATE page_shares SET revoked_at = CURRENT_TIMESTAMP WHERE page_id = ?",
    ).run(pageId);
  }

  setMfaSecret(userId: number, secret: string | null, enabled: boolean): void {
    this.#database.prepare(
      "UPDATE users SET mfa_secret = ?, mfa_enabled = ? WHERE id = ?",
    ).run(secret, enabled ? 1 : 0, userId);
    if (!enabled) {
      this.#database.prepare("DELETE FROM mfa_challenges WHERE user_id = ?")
        .run(userId);
      this.#database.prepare("DELETE FROM mfa_recovery_codes WHERE user_id = ?")
        .run(userId);
    }
  }

  async createMfaRecoveryCodes(userId: number): Promise<string[]> {
    this.#database.prepare("DELETE FROM mfa_recovery_codes WHERE user_id = ?")
      .run(userId);
    const codes: string[] = [];
    const insert = this.#database.prepare(
      "INSERT INTO mfa_recovery_codes (user_id, code_hash) VALUES (?, ?)",
    );
    for (let index = 0; index < 8; index++) {
      const compact = createSessionToken().replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 10).toUpperCase();
      const code = `${compact.slice(0, 5)}-${compact.slice(5)}`;
      insert.run(userId, await hashSessionToken(compact));
      codes.push(code);
    }
    return codes;
  }

  async consumeMfaRecoveryCode(
    userId: number,
    code: string,
  ): Promise<boolean> {
    const compact = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const codeHash = await hashSessionToken(compact);
    const result = this.#database.prepare(
      `UPDATE mfa_recovery_codes SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND code_hash = ? AND used_at IS NULL`,
    ).run(userId, codeHash);
    return Number(result.changes) === 1;
  }

  async createMfaChallenge(userId: number): Promise<string> {
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    this.#database.prepare(
      `INSERT INTO mfa_challenges (token_hash, user_id, expires_at)
       VALUES (?, ?, ?)`,
    ).run(await hashSessionToken(token), userId, expiresAt);
    return token;
  }

  async getMfaChallenge(token: string, consume = false): Promise<User | null> {
    const tokenHash = await hashSessionToken(token);
    const row = this.#database.prepare(
      `SELECT users.id, users.name, users.email, users.password_hash,
              users.mfa_secret, users.mfa_enabled
       FROM mfa_challenges
       JOIN users ON users.id = mfa_challenges.user_id
       WHERE mfa_challenges.token_hash = ? AND mfa_challenges.expires_at > ?
         AND mfa_challenges.attempts < 5`,
    ).get(tokenHash, new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    if (consume) {
      this.#database.prepare(
        "DELETE FROM mfa_challenges WHERE token_hash = ?",
      ).run(tokenHash);
    }
    return row ? mapUser(row) : null;
  }

  async recordMfaFailure(token: string): Promise<void> {
    this.#database.prepare(
      "UPDATE mfa_challenges SET attempts = attempts + 1 WHERE token_hash = ?",
    ).run(await hashSessionToken(token));
  }

  async createPasswordReset(email: string): Promise<string | null> {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    this.#database.prepare(
      `INSERT INTO password_resets (token_hash, user_id, expires_at)
       VALUES (?, ?, ?)`,
    ).run(await hashSessionToken(token), user.id, expiresAt);
    return token;
  }

  async resetPassword(token: string, passwordHash: string): Promise<boolean> {
    const tokenHash = await hashSessionToken(token);
    const reset = this.#database.prepare(
      `SELECT user_id FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    ).get(tokenHash, new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    if (!reset) return false;
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      this.#database.prepare(
        "UPDATE users SET password_hash = ? WHERE id = ?",
      ).run(passwordHash, Number(reset.user_id));
      this.#database.prepare(
        "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ?",
      ).run(tokenHash);
      this.#database.prepare("DELETE FROM sessions WHERE user_id = ?").run(
        Number(reset.user_id),
      );
      this.#database.exec("COMMIT");
      return true;
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  async createOidcState(verifier: string): Promise<string> {
    const state = createSessionToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    this.#database.prepare(
      "INSERT INTO oidc_states (state_hash, verifier, expires_at) VALUES (?, ?, ?)",
    ).run(await hashSessionToken(state), verifier, expiresAt);
    return state;
  }

  async consumeOidcState(state: string): Promise<string | null> {
    const stateHash = await hashSessionToken(state);
    const row = this.#database.prepare(
      "SELECT verifier FROM oidc_states WHERE state_hash = ? AND expires_at > ?",
    ).get(stateHash, new Date().toISOString()) as
      | Record<string, unknown>
      | undefined;
    this.#database.prepare("DELETE FROM oidc_states WHERE state_hash = ?").run(
      stateHash,
    );
    return row ? String(row.verifier) : null;
  }

  findOrCreateOidcUser(input: {
    issuer: string;
    subject: string;
    email: string;
    name: string;
    emailVerified: boolean;
    autoProvision: boolean;
  }): User | null {
    const identity = this.#database.prepare(
      `SELECT users.id, users.name, users.email, users.password_hash,
              users.mfa_secret, users.mfa_enabled
       FROM oidc_identities
       JOIN users ON users.id = oidc_identities.user_id
       WHERE oidc_identities.issuer = ? AND oidc_identities.subject = ?`,
    ).get(input.issuer, input.subject) as
      | Record<string, unknown>
      | undefined;
    if (identity) return mapUser(identity);

    let user = input.emailVerified ? this.findUserByEmail(input.email) : null;
    if (!user && (!input.autoProvision || !input.emailVerified)) return null;

    this.#database.exec("BEGIN IMMEDIATE");
    try {
      if (!user) {
        const result = this.#database.prepare(
          "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        ).run(
          input.name,
          input.email,
          `oidc-only:${createSessionToken()}`,
        );
        const userId = Number(result.lastInsertRowid);
        const workspace = this.#database.prepare(
          "SELECT id FROM workspaces ORDER BY id LIMIT 1",
        ).get() as Record<string, unknown> | undefined;
        if (!workspace) throw new Error("No workspace exists.");
        this.#database.prepare(
          "INSERT INTO memberships (user_id, workspace_id, role) VALUES (?, ?, 'reader')",
        ).run(userId, Number(workspace.id));
        user = {
          id: userId,
          name: input.name,
          email: input.email,
          passwordHash: "",
          mfaSecret: null,
          mfaEnabled: false,
        };
      }
      this.#database.prepare(
        `INSERT INTO oidc_identities (issuer, subject, user_id)
         VALUES (?, ?, ?)`,
      ).run(input.issuer, input.subject, user.id);
      this.#database.exec("COMMIT");
      return user;
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  createAsset(input: {
    userId: number;
    pageId: number;
    storageName: string;
    originalName: string;
    mimeType: string;
    size: number;
  }): number {
    const page = this.getPageForUser(input.pageId, input.userId);
    if (!page) throw new Error("Page not found.");
    this.#assertCanEdit(input.userId, page.workspaceId);
    const result = this.#database.prepare(
      `INSERT INTO assets
        (page_id, uploaded_by, storage_name, original_name, mime_type, size)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      input.pageId,
      input.userId,
      input.storageName,
      input.originalName,
      input.mimeType,
      input.size,
    );
    return Number(result.lastInsertRowid);
  }

  getAsset(assetId: number): {
    id: number;
    pageId: number;
    storageName: string;
    originalName: string;
    mimeType: string;
    size: number;
  } | null {
    const row = this.#database.prepare(
      `SELECT id, page_id, storage_name, original_name, mime_type, size
       FROM assets WHERE id = ?`,
    ).get(assetId) as Record<string, unknown> | undefined;
    return row
      ? {
        id: Number(row.id),
        pageId: Number(row.page_id),
        storageName: String(row.storage_name),
        originalName: String(row.original_name),
        mimeType: String(row.mime_type),
        size: Number(row.size),
      }
      : null;
  }

  listAssets(userId: number, pageId: number): Array<{
    id: number;
    originalName: string;
    mimeType: string;
    size: number;
  }> {
    const page = this.getPageForUser(pageId, userId);
    if (!page) throw new Error("Page not found.");
    return (this.#database.prepare(
      "SELECT id, original_name, mime_type, size FROM assets WHERE page_id = ? ORDER BY id DESC",
    ).all(pageId) as Array<Record<string, unknown>>).map((row) => ({
      id: Number(row.id),
      originalName: String(row.original_name),
      mimeType: String(row.mime_type),
      size: Number(row.size),
    }));
  }

  deleteAsset(userId: number, assetId: number): string {
    const asset = this.getAsset(assetId);
    if (!asset) throw new Error("Asset not found.");
    const page = this.getPageForUser(asset.pageId, userId);
    if (!page) throw new Error("Asset not found.");
    this.#assertCanEdit(userId, page.workspaceId);
    this.#database.prepare("DELETE FROM assets WHERE id = ?").run(assetId);
    return asset.storageName;
  }

  canReadAsset(userId: number | null, assetId: number): boolean {
    const row = this.#database.prepare(
      `SELECT pages.visibility AS page_visibility,
              books.visibility AS book_visibility,
              workspaces.visibility AS workspace_visibility,
              memberships.user_id AS member_id
       FROM assets
       JOIN pages ON pages.id = assets.page_id
       JOIN books ON books.id = pages.book_id
       JOIN workspaces ON workspaces.id = books.workspace_id
       LEFT JOIN memberships ON memberships.workspace_id = workspaces.id
         AND memberships.user_id = ?
       WHERE assets.id = ?`,
    ).get(userId, assetId) as Record<string, unknown> | undefined;
    if (!row) return false;
    return row.member_id !== null && row.member_id !== undefined ||
      (row.workspace_visibility === "public" &&
        row.book_visibility === "public" && row.page_visibility === "public");
  }

  #assertMember(userId: number, workspaceId: number): void {
    const member = this.#database.prepare(
      "SELECT 1 FROM memberships WHERE user_id = ? AND workspace_id = ?",
    ).get(userId, workspaceId);
    if (!member) throw new Error("You do not have access to this workspace.");
  }

  #assertOwner(userId: number, workspaceId: number): void {
    const owner = this.#database.prepare(
      `SELECT 1 FROM memberships
       WHERE user_id = ? AND workspace_id = ? AND role = 'owner'`,
    ).get(userId, workspaceId);
    if (!owner) throw new Error("Owner permission is required.");
  }

  #ownerCount(workspaceId: number): number {
    const row = this.#database.prepare(
      "SELECT COUNT(*) AS count FROM memberships WHERE workspace_id = ? AND role = 'owner'",
    ).get(workspaceId) as { count: number };
    return Number(row.count);
  }

  #assertCanEdit(userId: number, workspaceId: number): void {
    if (!this.canEditWorkspace(userId, workspaceId)) {
      throw new Error("You do not have permission to edit this workspace.");
    }
  }

  #migrate(): void {
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS workspaces (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS memberships (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'reader')),
        PRIMARY KEY (user_id, workspace_id)
      );
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')),
        position INTEGER NOT NULL DEFAULT 0,
        UNIQUE (workspace_id, slug)
      );
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')),
        position INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (book_id, slug)
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS page_revisions (
        id INTEGER PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        email TEXT NOT NULL COLLATE NOCASE,
        role TEXT NOT NULL CHECK (role IN ('editor', 'reader')),
        token_hash TEXT NOT NULL UNIQUE,
        invited_by INTEGER NOT NULL REFERENCES users(id),
        expires_at TEXT NOT NULL,
        accepted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS page_shares (
        id INTEGER PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        created_by INTEGER NOT NULL REFERENCES users(id),
        expires_at TEXT NOT NULL,
        revoked_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        uploaded_by INTEGER NOT NULL REFERENCES users(id),
        storage_name TEXT NOT NULL UNIQUE,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS mfa_challenges (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS password_resets (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL UNIQUE,
        used_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS oidc_states (
        state_hash TEXT PRIMARY KEY,
        verifier TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS oidc_identities (
        issuer TEXT NOT NULL,
        subject TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (issuer, subject),
        UNIQUE (issuer, user_id)
      );
      CREATE TABLE IF NOT EXISTS auth_attempts (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL COLLATE NOCASE,
        attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS auth_attempts_email
        ON auth_attempts(email, attempted_at);
      CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS pages_book_id ON pages(book_id);
    `);

    const workspaceColumns = this.#database.prepare(
      "PRAGMA table_info(workspaces)",
    ).all() as Array<Record<string, unknown>>;
    if (!workspaceColumns.some((column) => column.name === "slug")) {
      this.#database.exec("ALTER TABLE workspaces ADD COLUMN slug TEXT");
      const workspaces = this.#database.prepare(
        "SELECT id, name FROM workspaces",
      ).all() as Array<Record<string, unknown>>;
      const update = this.#database.prepare(
        "UPDATE workspaces SET slug = ? WHERE id = ?",
      );
      for (const workspace of workspaces) {
        update.run(uniqueSlug(String(workspace.name)), Number(workspace.id));
      }
    }
    this.#database.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS workspaces_slug ON workspaces(slug)",
    );
    const userColumns = this.#database.prepare("PRAGMA table_info(users)")
      .all() as Array<Record<string, unknown>>;
    if (!userColumns.some((column) => column.name === "mfa_secret")) {
      this.#database.exec("ALTER TABLE users ADD COLUMN mfa_secret TEXT");
    }
    if (!userColumns.some((column) => column.name === "mfa_enabled")) {
      this.#database.exec(
        "ALTER TABLE users ADD COLUMN mfa_enabled INTEGER NOT NULL DEFAULT 0",
      );
    }
    const challengeColumns = this.#database.prepare(
      "PRAGMA table_info(mfa_challenges)",
    ).all() as Array<Record<string, unknown>>;
    if (!challengeColumns.some((column) => column.name === "attempts")) {
      this.#database.exec(
        "ALTER TABLE mfa_challenges ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0",
      );
    }
    const shareColumns = this.#database.prepare(
      "PRAGMA table_info(page_shares)",
    )
      .all() as Array<Record<string, unknown>>;
    if (!shareColumns.some((column) => column.name === "expires_at")) {
      this.#database.exec("ALTER TABLE page_shares ADD COLUMN expires_at TEXT");
      this.#database.exec(
        "UPDATE page_shares SET expires_at = datetime('now', '+30 days') WHERE expires_at IS NULL",
      );
    }
  }
}

function mapPage(row: Record<string, unknown>): PageDetail {
  return {
    id: Number(row.id),
    bookId: Number(row.book_id),
    workspaceId: Number(row.workspace_id),
    workspaceSlug: String(row.workspace_slug),
    workspaceVisibility: row.workspace_visibility as ContentVisibility,
    bookTitle: String(row.book_title),
    bookSlug: String(row.book_slug),
    bookVisibility: row.book_visibility as ContentVisibility,
    title: String(row.title),
    slug: String(row.slug),
    body: String(row.body),
    visibility: row.visibility as ContentVisibility,
    updatedAt: String(row.updated_at),
  };
}

function uniqueSlug(title: string): string {
  const base = title.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function excerpt(body: string, query: string): string {
  const normalized = body.replace(/[#*_>`|\\[\\]]/g, " ").replace(/\s+/g, " ")
    .trim();
  const index = normalized.toLowerCase().indexOf(query.toLowerCase());
  const start = Math.max(0, index < 0 ? 0 : index - 60);
  const value = normalized.slice(start, start + 180);
  return `${start > 0 ? "…" : ""}${value}${
    start + 180 < normalized.length ? "…" : ""
  }`;
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    mfaSecret: row.mfa_secret ? String(row.mfa_secret) : null,
    mfaEnabled: Number(row.mfa_enabled ?? 0) === 1,
  };
}
