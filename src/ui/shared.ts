import { icon } from "./icons.ts";

export function page(title: string, body: string, bodyClass = ""): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <script>(function(){try{var t=localStorage.getItem("atrium-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/app.css?v=12">
    <script src="/assets/app.js?v=12" defer></script>
  </head>
  <body class="${escapeHtml(bodyClass)}">${body}
    <dialog class="search-dialog" data-search-dialog aria-labelledby="search-dialog-title">
      <div class="search-dialog-shell">
        <header>
          ${icon("search")}
          <input type="search" data-search-input placeholder="Search pages…"
            aria-label="Search pages" autocomplete="off">
          <kbd>esc</kbd>
        </header>
        <div class="search-dialog-results" data-search-results>
          <p id="search-dialog-title">Type to search every page you can access.</p>
        </div>
        <footer><span>↑↓ navigate</span><span>↵ open</span></footer>
      </div>
    </dialog>
    <dialog class="dialog settings-dialog" data-settings-dialog
      aria-label="Settings">
      <div class="dialog-shell">
        <button type="button" class="dialog-close" data-dialog-close
          aria-label="Close">${icon("x")}</button>
        <div class="dialog-body" data-settings-dialog-body></div>
      </div>
    </dialog>
    <dialog class="dialog confirm-dialog" data-confirm-dialog
      aria-labelledby="confirm-dialog-title">
      <form method="dialog" class="dialog-shell">
        <header class="dialog-header">
          <h2 id="confirm-dialog-title" data-confirm-title>Are you sure?</h2>
          <button type="button" class="dialog-close" data-dialog-close
            aria-label="Close">${icon("x")}</button>
        </header>
        <p class="dialog-description" data-confirm-description></p>
        <footer class="dialog-footer">
          <button type="button" class="button button-secondary"
            data-confirm-cancel>Cancel</button>
          <button type="button" class="button button-danger"
            data-confirm-accept>Delete</button>
        </footer>
      </form>
    </dialog>
    <div class="toast-stack" data-toast-stack aria-live="polite"></div>
  </body>
</html>`;
}

export function emptyState(
  iconName: Parameters<typeof icon>[0],
  title: string,
  hint: string,
): string {
  return `<div class="empty-state">
    ${icon(iconName)}
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(hint)}</span>
  </div>`;
}

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export type PageTab = "content" | "history" | "files";

export function pageTabs(pageId: number, active: PageTab): string {
  const tab = (target: PageTab, href: string, label: string) =>
    `<a class="tab ${target === active ? "tab-active" : ""}" href="${href}" ${
      target === active ? 'aria-current="page"' : ""
    }>${label}</a>`;
  return `<nav class="tabs" role="tablist" aria-label="Page views">
    ${tab("content", `/pages/${pageId}`, "Content")}
    ${tab("history", `/pages/${pageId}/revisions`, "History")}
    ${tab("files", `/pages/${pageId}/assets`, "Files")}
  </nav>`;
}
