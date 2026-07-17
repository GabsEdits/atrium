export const clientScript = `
const editor = document.querySelector('[data-markdown-editor]');
if (editor) {
  const textarea = editor.querySelector('textarea[name="body"]');
  const preview = editor.querySelector('[data-preview]');
  let previewTimer;

  const wrap = (before, after = before, placeholder = "text") => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end) || placeholder;
    textarea.setRangeText(before + selected + after, start, end, "select");
    textarea.focus();
    refreshPreview();
  };

  const line = (prefix, placeholder = "Text") => {
    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf("\\n", start - 1) + 1;
    textarea.setRangeText(prefix, lineStart, lineStart, "end");
    if (!textarea.value.slice(lineStart + prefix.length).trim()) {
      textarea.setRangeText(placeholder, textarea.selectionStart, textarea.selectionStart, "select");
    }
    textarea.focus();
    refreshPreview();
  };

  const insertTable = () => wrap(
    "| Column | Column |\\n| --- | --- |\\n| Value | Value |\\n\\n",
    "",
    ""
  );

  const actions = {
    heading: () => line("## ", "Heading"),
    bold: () => wrap("**", "**", "bold text"),
    italic: () => wrap("_", "_", "italic text"),
    link: () => wrap("[", "](https://)", "link text"),
    bullet: () => line("- ", "List item"),
    quote: () => line("> ", "Quote"),
    code: () => wrap("\\n\\n\\\`\\\`\\\`\\n", "\\n\\\`\\\`\\\`\\n", "code"),
    table: insertTable,
  };

  editor.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("click", () => actions[button.dataset.format]?.());
  });

  const refreshPreview = () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        body: textarea.value,
      });
      if (response.ok) preview.innerHTML = await response.text();
    }, 180);
  };
  textarea.addEventListener("input", refreshPreview);
}
`;
