import type { PageDetail } from "../store.ts";
import { renderMarkdown } from "../renderer.ts";
import { escapeHtml, page } from "./shared.ts";

export async function renderPublicPage(document: PageDetail): Promise<string> {
  const content = await renderMarkdown(document.body);
  return page(
    document.title,
    `<header class="public-header">
      <a class="wordmark" href="/">
        <span class="brand-mark brand-mark-small">A</span><span>Atrium</span>
      </a>
      <span>${escapeHtml(document.bookTitle)}</span>
    </header>
    <main class="public-document">
      <article class="document">${content}</article>
    </main>`,
    "public-body",
  );
}
