import type { PageDetail } from "../store.ts";
import { renderMarkdown } from "../renderer.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderPublicPage(document: PageDetail): string {
  return page(
    document.title,
    `<header class="public-header">
      <a class="wordmark" href="/">
        <span class="brand-mark brand-mark-small">A</span><span>Atrium</span>
      </a>
      <span>${escapeHtml(document.bookTitle)}</span>
    </header>
    <main class="public-document">
      <article class="document">${renderMarkdown(document.body)}</article>
    </main>`,
    "public-body",
  );
}
