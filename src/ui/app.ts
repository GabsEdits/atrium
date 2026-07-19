import type { User, WorkspaceOverview } from "../store.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderApp(user: User, workspace: WorkspaceOverview): string {
  const activeBook = workspace.books[0];
  const activePage = activeBook?.pages[0];

  return page(
    `${workspace.name} · Atrium`,
    `<div class="atrium-shell">
      ${bookRail(user, workspace, activeBook?.id)}
      ${documentPanel(workspace, activeBook?.id, activePage?.id)}
      <main class="workspace-canvas">
        <header class="workspace-bar">
          <div class="breadcrumbs">
            <span>${escapeHtml(activeBook?.title ?? "Library")}</span>
            <span>/</span>
            <strong>${escapeHtml(activePage?.title ?? "Welcome")}</strong>
          </div>
          <a class="global-search" href="/search">
            <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
            <span>Search everything</span><kbd>⌘ K</kbd>
          </a>
          <div class="topbar-actions">
            <span class="visibility-badge">
              <span class="visibility-dot visibility-${workspace.visibility}"></span>
              ${escapeHtml(workspace.visibility)}
            </span>
            ${
      activePage
        ? `<a class="button button-secondary compact-button"
              href="/pages/${activePage.id}/edit">Edit</a>`
        : ""
    }
            <a class="icon-button" href="/settings/members"
              aria-label="Workspace settings"><i class="ph ph-gear"
                aria-hidden="true"></i></a>
          </div>
        </header>
        <article class="document">
          <div class="document-meta">
            <span class="document-icon"><i class="ph ph-sparkle"
              aria-hidden="true"></i></span>
            <span>Getting started</span>
          </div>
          <h1>Welcome to Atrium</h1>
          <p class="document-lead">
            A calm place for your team’s knowledge. This workspace and page
            are private by default.
          </p>
          <hr>
          <h2>Start building your library</h2>
          <p>
            Organize knowledge into books and pages. When you’re ready, choose
            whether each part stays private or becomes public.
          </p>
          <div class="callout">
            <i class="ph ph-info" aria-hidden="true"></i>
            <div>
              <strong>Privacy is inherited</strong>
              <p>New books and pages begin with their workspace visibility.</p>
            </div>
          </div>
        </article>
      </main>
    </div>`,
    "app-body",
  );
}

function bookRail(
  user: User,
  workspace: WorkspaceOverview,
  activeBookId?: number,
): string {
  const books = workspace.books.map((book) => {
    const href = book.pages[0] ? `/pages/${book.pages[0].id}` : "/";
    const initials = book.title.trim().split(/\s+/).slice(0, 2)
      .map((word) => word.charAt(0)).join("").toUpperCase();
    return `<a class="book-tile ${
      book.id === activeBookId ? "book-tile-active" : ""
    } book-color-${escapeHtml(book.color)}"
      href="${href}" title="${escapeHtml(book.title)}"
      aria-label="${escapeHtml(book.title)}">
      <span class="${book.icon ? "book-emoji" : ""}">${
      escapeHtml(book.icon || initials || "B")
    }</span>
      <small>${book.pages.length}</small>
    </a>`;
  }).join("");

  return `<aside class="book-rail">
    <a class="rail-brand" href="/" aria-label="Atrium home">A</a>
    <nav class="book-stack" aria-label="Books">${books}</nav>
    <form method="post" action="/books" class="rail-create">
      <button aria-label="Create book" title="Create book">＋</button>
    </form>
    <details class="rail-account">
      <summary aria-label="Account menu" title="${escapeHtml(user.name)}">
        ${escapeHtml(user.name.charAt(0))}
      </summary>
      <div class="rail-account-menu">
        <strong>${escapeHtml(user.name)}</strong>
        <span>${escapeHtml(user.email)}</span>
        <a href="/settings/members">Workspace settings</a>
        <a href="/account/security">Account security</a>
        <form method="post" action="/logout"><button>Sign out</button></form>
      </div>
    </details>
  </aside>`;
}

function documentPanel(
  workspace: WorkspaceOverview,
  activeBookId?: number,
  activePageId?: number,
): string {
  const book = workspace.books.find((item) => item.id === activeBookId);
  if (!book) return `<aside class="document-panel"></aside>`;
  return `<aside class="document-panel">
    <header>
      <form method="post" action="/books/${book.id}" class="book-title-form"
        data-book-title-form>
        <span class="visibility-dot visibility-${book.visibility}"></span>
        <input name="title" value="${escapeHtml(book.title)}"
          aria-label="Rename ${
    escapeHtml(book.title)
  }" maxlength="120" required>
        <input type="hidden" name="returnTo" value="${activePageId ?? ""}">
        <button aria-label="Save book name" title="Save name">✓</button>
      </form>
      <form method="post" action="/pages">
        <input type="hidden" name="bookId" value="${book.id}">
        <input type="hidden" name="visibility" value="${book.visibility}">
        <button aria-label="New page in ${escapeHtml(book.title)}"
          title="New page">＋</button>
      </form>
      <details class="book-menu page-menu">
        <summary class="icon-button" aria-label="Book actions">•••</summary>
        <div class="page-menu-popover">
          ${bookAppearanceForm(book, activePageId)}
          <form method="post" action="/books/${book.id}/delete"
            data-confirm="Delete “${
    escapeHtml(book.title)
  }” and all its pages? This cannot be undone.">
            <button class="danger-action">Delete book</button>
          </form>
        </div>
      </details>
    </header>
    <nav aria-label="${escapeHtml(book.title)} pages">
      ${
    book.pages.map((item) =>
      `<a class="${item.id === activePageId ? "document-link-active" : ""}"
          href="/pages/${item.id}">
        <span>⌞</span>${escapeHtml(item.title)}
      </a>`
    ).join("")
  }
    </nav>
  </aside>`;
}

function bookAppearanceForm(
  book: WorkspaceOverview["books"][number],
  activePageId?: number,
): string {
  const colors = [
    "slate",
    "sand",
    "forest",
    "indigo",
    "rose",
    "amber",
    "sky",
    "violet",
  ];
  return `<form method="post" action="/books/${book.id}/appearance"
    class="book-appearance-form">
    <strong>Book appearance</strong>
    <div class="book-color-options" aria-label="Book color">
      ${
    colors.map((color) =>
      `<label class="book-color-${color}" title="${color}">
        <input type="radio" name="color" value="${color}"
          ${book.color === color ? "checked" : ""}>
        <span></span>
      </label>`
    ).join("")
  }
    </div>
    <label class="book-icon-field">
      <span>Text</span>
      <input name="icon" value="${escapeHtml(book.icon ?? "")}"
        maxlength="16" placeholder="e.g. 📘">
    </label>
    <input type="hidden" name="returnTo" value="${activePageId ?? ""}">
    <button class="button button-secondary" type="submit">Update</button>
  </form>`;
}
