import type { User, WorkspaceOverview } from "../store.ts";
import { emptyState, escapeHtml, page } from "./shared.ts";
import { icon, logoMark } from "./icons.ts";

export function renderApp(
  user: User,
  workspace: WorkspaceOverview,
  recentPages: Array<
    { id: number; title: string; bookTitle: string; updatedAt: string }
  > = [],
): string {
  const totalPages = workspace.books.reduce(
    (sum, book) => sum + book.pages.length,
    0,
  );
  const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;

  return page(
    `${workspace.name} · Atrium`,
    `<div class="atrium-shell">
      ${bookRail(user, workspace)}
      ${documentPanel(workspace)}
      <main class="workspace-canvas">
        <header class="workspace-bar">
          <div class="breadcrumbs">
            <strong>Home</strong>
          </div>
          <a class="global-search" href="/search">
            ${icon("search")}
            <span>Search everything</span><kbd>⌘ K</kbd>
          </a>
          <div class="topbar-actions">
            <span class="visibility-badge">
              <span class="visibility-dot visibility-${workspace.visibility}"></span>
              ${escapeHtml(workspace.visibility)}
            </span>
          </div>
        </header>
        <article class="document dashboard">
          <p class="eyebrow">${greeting()}</p>
          <h1>${escapeHtml(firstName)}’s workspace</h1>
          <p class="document-lead">
            ${workspace.books.length} book${
      workspace.books.length === 1 ? "" : "s"
    } ·
            ${totalPages} page${totalPages === 1 ? "" : "s"} ·
            ${escapeHtml(workspace.visibility)}
          </p>
          <div class="dashboard-actions">
            <form method="post" action="/pages" class="dashboard-action">
              <input type="hidden" name="bookId" value="${
      workspace.books[0]?.id ?? ""
    }">
              <input type="hidden" name="visibility" value="${
      workspace.books[0]?.visibility ?? "private"
    }">
              <button class="dashboard-action-button" type="submit" ${
      workspace.books[0] ? "" : "disabled"
    }>
                ${icon("plus")}<span>New page</span>
              </button>
            </form>
            <form method="post" action="/books" class="dashboard-action">
              <button class="dashboard-action-button" type="submit">
                ${icon("circle-plus")}<span>New book</span>
              </button>
            </form>
            <a class="dashboard-action-button" href="/search">
              ${icon("search")}<span>Search everything</span>
            </a>
          </div>
          <h2>Recently updated</h2>
          ${
      recentPages.length === 0
        ? emptyState(
          "inbox",
          "Nothing yet",
          "Pages you create or edit will show up here.",
        )
        : `<div class="dashboard-recent">
              ${
          recentPages.map((item) => `
                <a class="dashboard-recent-item" href="/pages/${item.id}">
                  <span>${escapeHtml(item.bookTitle)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${relativeTime(item.updatedAt)}</small>
                </a>`).join("")
        }
            </div>`
    }
        </article>
      </main>
    </div>`,
    "app-body",
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso + "Z").getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso + "Z").toLocaleDateString();
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
    <a class="rail-brand" href="/" aria-label="Atrium home">${logoMark}</a>
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
        <a href="/settings/members" data-dialog-fetch>Workspace settings</a>
        <a href="/account/security" data-dialog-fetch>Account security</a>
        <button type="button" data-theme-toggle>Toggle theme</button>
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
    <nav aria-label="${escapeHtml(book.title)} pages" data-page-nav
      data-book-id="${book.id}">
      ${
    book.pages.map((item) =>
      `<a class="${item.id === activePageId ? "document-link-active" : ""}"
          href="/pages/${item.id}" draggable="true" data-page-id="${item.id}">
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
