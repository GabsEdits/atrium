export function page(title: string, body: string, bodyClass = ""): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/app.css?v=8">
    <script src="/assets/app.js?v=8" defer></script>
  </head>
  <body class="${escapeHtml(bodyClass)}">${body}
    <dialog class="search-dialog" data-search-dialog aria-labelledby="search-dialog-title">
      <div class="search-dialog-shell">
        <header>
          <span>⌕</span>
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
  </body>
</html>`;
}

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
