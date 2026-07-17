import { render } from "@steno/steno";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const documentTemplate = `<div class="rendered-markdown">{@html content}</div>`;

export function renderMarkdown(markdown: string): string {
  const parsed = marked.parse(markdown, {
    async: false,
    gfm: true,
  }) as string;
  const content = sanitizeHtml(parsed, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "del",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      code: ["class"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return render({
    template: documentTemplate,
    context: { content },
    components: {},
    filePath: "atrium/page-preview.scr",
  });
}
