import type { User, WorkspaceOverview } from "../store.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderApp(user: User, workspace: WorkspaceOverview): string {
  const books = workspace.books.map((book) => `
    <section class="nav-group">
      <div class="nav-group-heading">
        <span>${escapeHtml(book.title)}</span>
        <span class="visibility-dot visibility-${book.visibility}"
          title="${book.visibility}"></span>
      </div>
      ${
    book.pages.map((item, index) => `
        <a class="page-link ${index === 0 ? "page-link-active" : ""}"
          href="/pages/${item.id}">
          <span class="page-icon">⌞</span>
          ${escapeHtml(item.title)}
        </a>`).join("")
  }
    </section>`).join("");

  const activeBook = workspace.books[0];
  const activePage = activeBook?.pages[0];

  return page(
    `${workspace.name} · Atrium`,
    `<div class="app-shell">
      <aside class="sidebar">
        <header class="sidebar-header">
          <a class="wordmark" href="/">
            <span class="brand-mark brand-mark-small">A</span>
            <span>Atrium</span>
          </a>
          <a class="icon-button" href="/search" aria-label="Search">⌕</a>
        </header>
        <button class="workspace-switcher">
          <span class="workspace-avatar">${
      escapeHtml(workspace.name.charAt(0))
    }</span>
          <span>
            <strong>${escapeHtml(workspace.name)}</strong>
            <small>${escapeHtml(workspace.role)}</small>
          </span>
          <span class="chevron">⌄</span>
        </button>
        <nav class="sidebar-nav" aria-label="Knowledge navigation">
          <a class="nav-item nav-item-active" href="/">
            <span>⌂</span> Home
          </a>
          <a class="nav-item" href="/recent"><span>◷</span> Recent</a>
          <div class="nav-separator"></div>
          <div class="nav-label">
            <span>Library</span>
            <form method="post" action="/books" class="inline-create">
              <button aria-label="New book">＋</button>
            </form>
          </div>
          ${books}
        </nav>
        <footer class="sidebar-footer">
          <div class="user-avatar">${escapeHtml(user.name.charAt(0))}</div>
          <div class="user-details">
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.email)}</span>
          </div>
          <form method="post" action="/logout">
            <button class="icon-button" aria-label="Sign out" title="Sign out">↗</button>
          </form>
          <a class="icon-button" href="/settings/members"
            aria-label="Workspace settings" title="Workspace settings">⚙</a>
          <a class="icon-button" href="/account/security"
            aria-label="Account security" title="Account security">⌾</a>
        </footer>
      </aside>
      <main class="content-shell">
        <header class="topbar">
          <div class="breadcrumbs">
            <span>${escapeHtml(activeBook?.title ?? "Library")}</span>
            <span>/</span>
            <strong>${escapeHtml(activePage?.title ?? "Welcome")}</strong>
          </div>
          <div class="topbar-actions">
            <span class="visibility-badge">
              <span class="visibility-dot visibility-${workspace.visibility}"></span>
              ${escapeHtml(workspace.visibility)}
            </span>
            <a class="button button-secondary"
              href="/pages/${activePage?.id ?? 1}/edit">Edit page</a>
            <button class="icon-button">•••</button>
          </div>
        </header>
        <article class="document">
          <div class="document-meta">
            <span class="document-icon">✦</span>
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
            <span>◎</span>
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
