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
  const main = editing
    ? `<form method="post" action="/pages/${document.id}" class="editor visual-editor"
        data-visual-editor data-upload-url="/pages/${document.id}/assets">
        <header class="workspace-bar editor-workspace-bar">
          <div class="breadcrumbs">
            <span>${escapeHtml(document.bookTitle)}</span><span>/</span>
            <strong>Editing</strong>
          </div>
          <a class="global-search" href="/search">
            <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
            <span>Search everything</span><kbd>⌘ K</kbd>
          </a>
          <div class="editor-actions">
            <a class="quiet-action" href="/pages/${document.id}">Cancel</a>
            <span class="save-state" data-save-state aria-live="polite"></span>
            <details class="visibility-menu">
              <summary><span class="visibility-dot visibility-${document.visibility}"></span>
                ${escapeHtml(document.visibility)}</summary>
              <div class="visibility-popover">
                <label>Workspace<select name="workspaceVisibility">
                  ${visibilityOptions(document.workspaceVisibility)}
                </select></label>
                <label>Book<select name="bookVisibility">
                  ${visibilityOptions(document.bookVisibility)}
                </select></label>
                <label>Page<select name="visibility">
                  ${visibilityOptions(document.visibility)}
                </select></label>
              </div>
            </details>
            <button class="button button-primary" type="submit">Save</button>
          </div>
        </header>
        ${
      error ? `<div class="alert editor-alert">${escapeHtml(error)}</div>` : ""
    }
        <div class="visual-editor-canvas">
          <section class="editor-page">
            <input class="title-input" name="title" value="${
      escapeHtml(document.title)
    }"
              aria-label="Page title" required>
            <div class="format-toolbar floating-format-toolbar" role="toolbar"
              aria-label="Text formatting">
              <select data-block-format aria-label="Text style">
                <option value="p">Text</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
              <span></span>
              <button type="button" data-command="bold" title="Bold"
                aria-label="Bold"><strong>B</strong></button>
              <button type="button" data-command="italic" title="Italic"
                aria-label="Italic"><em>I</em></button>
              <button type="button" data-command="createLink" title="Link"
                aria-label="Add link">↗</button>
              <span></span>
              <button type="button" data-command="insertUnorderedList" title="Bulleted list"
                aria-label="Add bulleted list">☷</button>
              <button type="button" data-block="blockquote" title="Quote"
                aria-label="Add quote">❞</button>
              <button type="button" data-insert-table title="Table"
                aria-label="Add table">▦</button>
              <span></span>
              <button type="button" data-upload-trigger title="Upload image or file"
                aria-label="Upload image or file">＋</button>
              <input data-upload-input type="file" hidden
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain">
            </div>
            <div class="visual-content rendered-markdown" contenteditable="true"
              data-visual-content aria-label="Page content" spellcheck="true">
              ${renderMarkdown(document.body)}
            </div>
            <textarea name="body" data-markdown-source hidden required>${
      escapeHtml(document.body)
    }</textarea>
            <p class="editor-hint">Select text to format · paste or upload images anywhere</p>
          </section>
        </div>
      </form>`
    : `<header class="topbar">
        <a class="global-search" href="/search">
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <span>Search everything</span><kbd>⌘ K</kbd>
        </a>
        <div class="breadcrumbs">
          <span>${escapeHtml(document.bookTitle)}</span><span>/</span>
          <strong>${escapeHtml(document.title)}</strong>
        </div>
        <div class="topbar-actions">
          <span class="visibility-badge">
            <span class="visibility-dot visibility-${document.visibility}"></span>
            ${escapeHtml(document.visibility)}
          </span>
          <a class="button button-secondary" href="/pages/${document.id}/edit">Edit</a>
          <details class="page-menu"><summary class="icon-button">•••</summary>
            <div class="page-menu-popover">
              <a href="/pages/${document.id}/revisions">History</a>
              <a href="/pages/${document.id}/assets">Files</a>
              <form method="post" action="/pages/${document.id}/share">
                <button>Copy share link</button>
              </form>
              <form method="post" action="/pages/${document.id}/share/revoke">
                <button>Revoke share links</button>
              </form>
              <form method="post" action="/pages/${document.id}/delete"
                data-confirm="Delete “${
      escapeHtml(document.title)
    }”? This cannot be undone.">
                <button class="danger-action">Delete page</button>
              </form>
              ${
      isPublic(document)
        ? `<a target="_blank" href="/s/${escapeHtml(document.workspaceSlug)}/${
          escapeHtml(document.bookSlug)
        }/${escapeHtml(document.slug)}">View public page</a>`
        : ""
    }
            </div>
          </details>
        </div>
      </header>
      <article class="document">
        ${renderMarkdown(document.body)}
        <p class="updated-at">Last updated ${escapeHtml(document.updatedAt)}</p>
      </article>`;

  return page(
    `${document.title} · Atrium`,
    `<div class="atrium-shell">
      ${bookRail(user, workspace, document.bookId)}
      ${documentPanel(workspace, document.bookId, document.id)}
      <main class="workspace-canvas">${main}</main>
    </div>`,
    "app-body",
  );
}

function bookRail(
  user: User,
  workspace: WorkspaceOverview,
  activeBookId: number,
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
  activeBookId: number,
  activePageId: number,
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
        <input type="hidden" name="returnTo" value="${activePageId}">
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
  activePageId: number,
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
      <span>Custom text</span>
      <input name="icon" value="${escapeHtml(book.icon ?? "")}"
        maxlength="16" placeholder="e.g. 📘">
    </label>
    <input type="hidden" name="returnTo" value="${activePageId}">
    <button class="button button-secondary" type="submit">Update</button>
  </form>`;
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
