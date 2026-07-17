import type { PageDetail, User, WorkspaceOverview } from "../store.ts";
import { renderMarkdown } from "../renderer.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderEditor(
  user: User,
  workspace: WorkspaceOverview,
  document: PageDetail,
  editing: boolean,
  error?: string,
): string {
  const navigation = workspace.books.map((book) => `
    <section class="nav-group">
      <div class="nav-group-heading">
        <span>${escapeHtml(book.title)}</span>
        <form method="post" action="/pages" class="inline-create">
          <input type="hidden" name="bookId" value="${book.id}">
          <input type="hidden" name="visibility" value="${book.visibility}">
          <button aria-label="New page in ${escapeHtml(book.title)}">＋</button>
        </form>
      </div>
      ${
    book.pages.map((item) => `
        <a class="page-link ${
      item.id === document.id ? "page-link-active" : ""
    }"
          href="/pages/${item.id}">
          <span class="page-icon">⌞</span>${escapeHtml(item.title)}
        </a>`).join("")
  }
    </section>`).join("");

  const main = editing
    ? `<form method="post" action="/pages/${document.id}" class="editor"
        data-markdown-editor>
        <header class="editor-toolbar">
          <a class="button button-secondary" href="/pages/${document.id}">Cancel</a>
          <div class="editor-actions">
            <label class="visibility-control">Workspace
              <select name="workspaceVisibility" aria-label="Workspace visibility">
                ${visibilityOptions(document.workspaceVisibility)}
              </select>
            </label>
            <label class="visibility-control">Book
              <select name="bookVisibility" aria-label="Book visibility">
                ${visibilityOptions(document.bookVisibility)}
              </select>
            </label>
            <label class="visibility-control">Page
              <select name="visibility" aria-label="Page visibility">
                ${visibilityOptions(document.visibility)}
              </select>
            </label>
            <button class="button button-primary" type="submit">Save changes</button>
          </div>
        </header>
        ${
      error ? `<div class="alert editor-alert">${escapeHtml(error)}</div>` : ""
    }
        <div class="editor-grid">
          <section class="editor-pane">
            <input class="title-input" name="title" value="${
      escapeHtml(document.title)
    }"
              aria-label="Page title" required>
            <div class="format-toolbar" role="toolbar" aria-label="Text formatting">
              <button type="button" data-format="heading" title="Heading"
                aria-label="Add heading">H₂</button>
              <button type="button" data-format="bold" title="Bold"
                aria-label="Bold"><strong>B</strong></button>
              <button type="button" data-format="italic" title="Italic"
                aria-label="Italic"><em>I</em></button>
              <span></span>
              <button type="button" data-format="link" title="Link"
                aria-label="Add link">↗</button>
              <button type="button" data-format="bullet" title="Bulleted list"
                aria-label="Add bulleted list">☷</button>
              <button type="button" data-format="quote" title="Quote"
                aria-label="Add quote">❞</button>
              <button type="button" data-format="code" title="Code"
                aria-label="Add code block">&lt;/&gt;</button>
              <button type="button" data-format="table" title="Table"
                aria-label="Add table">▦</button>
            </div>
            <textarea name="body" aria-label="Markdown" spellcheck="true"
              required>${escapeHtml(document.body)}</textarea>
          </section>
          <section class="preview-pane" aria-label="Preview">
            <div class="preview-label">Preview · Steno</div>
            <article class="document document-preview" data-preview>
              ${renderMarkdown(document.body)}
            </article>
          </section>
        </div>
      </form>`
    : `<header class="topbar">
        <div class="breadcrumbs">
          <span>${escapeHtml(document.bookTitle)}</span><span>/</span>
          <strong>${escapeHtml(document.title)}</strong>
        </div>
        <div class="topbar-actions">
          <span class="visibility-badge">
            <span class="visibility-dot visibility-${document.visibility}"></span>
            ${escapeHtml(document.visibility)}
          </span>
          <a class="button button-secondary" href="/pages/${document.id}/edit">Edit page</a>
          <a class="button button-secondary"
            href="/pages/${document.id}/revisions">History</a>
          <form method="post" action="/pages/${document.id}/share">
            <button class="button button-secondary">Share link</button>
          </form>
          <form method="post" action="/pages/${document.id}/share/revoke">
            <button class="button button-secondary">Revoke links</button>
          </form>
          ${
      isPublic(document)
        ? `<a class="button button-secondary" target="_blank"
              href="/s/${escapeHtml(document.workspaceSlug)}/${
          escapeHtml(document.bookSlug)
        }/${escapeHtml(document.slug)}">View public page</a>`
        : ""
    }
        </div>
      </header>
      <div class="upload-bar">
        <span>Images and attachments</span>
        <a class="button button-secondary"
          href="/pages/${document.id}/assets">Manage files</a>
      </div>
      <article class="document">
        ${renderMarkdown(document.body)}
        <p class="updated-at">Last updated ${escapeHtml(document.updatedAt)}</p>
      </article>`;

  return page(
    `${document.title} · Atrium`,
    `<div class="app-shell">
      <aside class="sidebar">
        <header class="sidebar-header">
          <a class="wordmark" href="/">
            <span class="brand-mark brand-mark-small">A</span><span>Atrium</span>
          </a>
          <a class="icon-button" href="/search" aria-label="Search">⌕</a>
        </header>
        <div class="workspace-switcher">
          <span class="workspace-avatar">${
      escapeHtml(workspace.name.charAt(0))
    }</span>
          <span><strong>${escapeHtml(workspace.name)}</strong>
            <small>${escapeHtml(workspace.role)}</small></span>
        </div>
        <nav class="sidebar-nav" aria-label="Knowledge navigation">
          <div class="nav-label">
            <span>Library</span>
            <form method="post" action="/books" class="inline-create">
              <button aria-label="New book">＋</button>
            </form>
          </div>
          ${navigation}
        </nav>
        <footer class="sidebar-footer">
          <div class="user-avatar">${escapeHtml(user.name.charAt(0))}</div>
          <div class="user-details"><strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.email)}</span></div>
        </footer>
      </aside>
      <main class="content-shell">${main}</main>
    </div>`,
    "app-body",
  );
}

function isPublic(document: PageDetail): boolean {
  return document.workspaceVisibility === "public" &&
    document.bookVisibility === "public" &&
    document.visibility === "public";
}

function visibilityOptions(selected: string): string {
  return ["private", "unlisted", "public"].map((visibility) =>
    `<option value="${visibility}" ${visibility === selected ? "selected" : ""}>
      ${visibility.charAt(0).toUpperCase() + visibility.slice(1)}
    </option>`
  ).join("");
}
