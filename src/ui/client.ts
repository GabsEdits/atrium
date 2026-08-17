export const clientScript = `
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
let searchTimer;
let searchController;
let searchIndex = 0;

const actionIcons = new Map([
  ["＋", "plus"],
  ["✓", "check"],
  ["•••", "ellipsis"],
  ["B", "bold"],
  ["I", "italic"],
  ["↗", "link"],
  ["☷", "list"],
  ["❞", "quote"],
  ["▦", "table"],
  ["save", "save"],
  ["cancel", "x"],
  ["edit", "pencil"],
  ["done", "check"],
  ["search", "search"],
  ["upload", "upload"],
  ["delete", "trash-2"],
  ["delete page", "trash-2"],
  ["delete book", "trash-2"],
  ["remove", "user-minus"],
  ["update", "save"],
  ["restore", "rotate-ccw"],
  ["back to page", "arrow-left"],
  ["return to editor", "arrow-left"],
  ["back to sign in", "arrow-left"],
  ["copy share link", "link"],
  ["revoke share links", "unlink"],
  ["sign out", "log-out"],
  ["create invitation", "user-plus"],
  ["create account", "user-plus"],
  ["accept invitation", "circle-check"],
  ["verify and sign in", "log-in"],
  ["send recovery link", "mail"],
  ["reset password", "rotate-cw"],
  ["disable mfa", "shield-off"],
  ["enable mfa", "shield-check"],
  ["set up authenticator", "qr-code"],
  ["set up atrium", "arrow-right"],
  ["create workspace", "circle-plus"],
  ["sign in", "log-in"],
  ["continue with single sign-on", "key"],
  ["open", "external-link"],
]);

const iconPaths = {
  "plus": '<path d="M5 12h14" /> <path d="M12 5v14" />',
  "check": '<path d="M20 6 9 17l-5-5" />',
  "ellipsis": '<circle cx="12" cy="12" r="1" /> <circle cx="19" cy="12" r="1" /> <circle cx="5" cy="12" r="1" />',
  "bold": '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />',
  "italic": '<line x1="19" x2="10" y1="4" y2="4" /> <line x1="14" x2="5" y1="20" y2="20" /> <line x1="15" x2="9" y1="4" y2="20" />',
  "link": '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  "list": '<path d="M3 5h.01" /> <path d="M3 12h.01" /> <path d="M3 19h.01" /> <path d="M8 5h13" /> <path d="M8 12h13" /> <path d="M8 19h13" />',
  "quote": '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /> <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />',
  "table": '<path d="M12 3v18" /> <rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M3 9h18" /> <path d="M3 15h18" />',
  "save": '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /> <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /> <path d="M7 3v4a1 1 0 0 0 1 1h7" />',
  "x": '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',
  "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',
  "search": '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',
  "upload": '<path d="M12 3v12" /> <path d="m17 8-5-5-5 5" /> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />',
  "trash-2": '<path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  "user-minus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <line x1="22" x2="16" y1="11" y2="11" />',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" />',
  "arrow-left": '<path d="m12 19-7-7 7-7" /> <path d="M19 12H5" />',
  "unlink": '<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" /> <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" /> <line x1="8" x2="8" y1="2" y2="5" /> <line x1="2" x2="5" y1="8" y2="8" /> <line x1="16" x2="16" y1="19" y2="22" /> <line x1="19" x2="22" y1="16" y2="16" />',
  "log-out": '<path d="m16 17 5-5-5-5" /> <path d="M21 12H9" /> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />',
  "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <line x1="19" x2="19" y1="8" y2="14" /> <line x1="22" x2="16" y1="11" y2="11" />',
  "circle-check": '<circle cx="12" cy="12" r="10" /> <path d="m9 12 2 2 4-4" />',
  "log-in": '<path d="m10 17 5-5-5-5" /> <path d="M15 12H3" /> <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />',
  "mail": '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /> <rect x="2" y="4" width="20" height="16" rx="2" />',
  "rotate-cw": '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" />',
  "shield-off": '<path d="m2 2 20 20" /> <path d="M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71" /> <path d="M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264" />',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" />',
  "qr-code": '<rect width="5" height="5" x="3" y="3" rx="1" /> <rect width="5" height="5" x="16" y="3" rx="1" /> <rect width="5" height="5" x="3" y="16" rx="1" /> <path d="M21 16h-3a2 2 0 0 0-2 2v3" /> <path d="M21 21v.01" /> <path d="M12 7v3a2 2 0 0 1-2 2H7" /> <path d="M3 12h.01" /> <path d="M12 3h.01" /> <path d="M12 16v.01" /> <path d="M16 12h1" /> <path d="M21 12v.01" /> <path d="M12 21v-1" />',
  "arrow-right": '<path d="M5 12h14" /> <path d="m12 5 7 7-7 7" />',
  "circle-plus": '<circle cx="12" cy="12" r="10" /> <path d="M8 12h8" /> <path d="M12 8v8" />',
  "key": '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /> <path d="m21 2-9.6 9.6" /> <circle cx="7.5" cy="15.5" r="5.5" />',
  "external-link": '<path d="M15 3h6v6" /> <path d="M10 14 21 3" /> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',
};

const buildIcon = (name) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"' +
    ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + iconPaths[name] + "</svg>";
  return wrapper.firstElementChild;
};

document.querySelectorAll(
  "button, a.button, a.quiet-action, a.icon-button, summary.icon-button",
).forEach((action) => {
  if (action.querySelector(".icon")) return;
  const label = action.textContent.trim();
  const iconName = actionIcons.get(label) || actionIcons.get(label.toLowerCase());
  if (!iconName || !iconPaths[iconName]) return;
  const icon = buildIcon(iconName);
  if (["＋", "✓", "•••", "B", "I", "↗", "☷", "❞", "▦"].includes(label)) {
    action.replaceChildren(icon);
  } else {
    action.prepend(icon);
  }
});

document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!window.confirm(form.dataset.confirm || "Are you sure?")) {
      event.preventDefault();
    }
  });
});

const openSearch = () => {
  if (!searchDialog || !searchInput) {
    window.location.assign("/search");
    return;
  }
  if (!searchDialog.open) searchDialog.showModal();
  searchInput.focus();
  searchInput.select();
};

document.querySelectorAll(".global-search").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openSearch();
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

if (searchDialog && searchInput && searchResults) {
  const resultLinks = () => Array.from(
    searchResults.querySelectorAll("[data-search-result]")
  );
  const selectResult = (index) => {
    const links = resultLinks();
    if (!links.length) return;
    searchIndex = (index + links.length) % links.length;
    links.forEach((link, itemIndex) =>
      link.classList.toggle("search-dialog-result-active", itemIndex === searchIndex)
    );
    links[searchIndex].scrollIntoView({ block: "nearest" });
  };
  const message = (text) => {
    searchResults.replaceChildren();
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    searchResults.append(paragraph);
  };
  const renderResults = (results) => {
    searchResults.replaceChildren();
    if (!results.length) {
      message("No matching pages.");
      return;
    }
    results.forEach((result, index) => {
      const link = document.createElement("a");
      link.href = "/pages/" + result.pageId;
      link.dataset.searchResult = "";
      const path = document.createElement("span");
      path.textContent = result.bookTitle;
      const title = document.createElement("strong");
      title.textContent = result.title;
      const excerpt = document.createElement("small");
      excerpt.textContent = result.excerpt;
      link.append(path, title, excerpt);
      link.addEventListener("mousemove", () => selectResult(index));
      searchResults.append(link);
    });
    selectResult(0);
  };
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchController?.abort();
    const query = searchInput.value.trim();
    if (!query) {
      message("Type to search every page you can access.");
      return;
    }
    searchTimer = setTimeout(async () => {
      searchController = new AbortController();
      message("Searching…");
      try {
        const response = await fetch("/api/search?q=" + encodeURIComponent(query), {
          headers: { accept: "application/json" },
          signal: searchController.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        renderResults((await response.json()).results);
      } catch (error) {
        if (error.name !== "AbortError") message("Search is unavailable.");
      }
    }, 140);
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectResult(searchIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectResult(searchIndex - 1);
    } else if (event.key === "Enter") {
      const selected = resultLinks()[searchIndex];
      if (selected) {
        event.preventDefault();
        selected.click();
      }
    }
  });
  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) searchDialog.close();
  });
}

document.querySelectorAll("[data-book-title-form]").forEach((form) => {
  const input = form.querySelector('input[name="title"]');
  const button = form.querySelector('button[type="submit"], button:not([type])');
  let savedTitle = input.value;
  const updateButton = () => {
    button.classList.toggle("book-title-save-visible", input.value.trim() !== savedTitle);
  };
  input.addEventListener("input", updateButton);
  input.addEventListener("focus", () => input.select());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
    } else if (event.key === "Escape") {
      input.value = savedTitle;
      input.blur();
      updateButton();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    button.disabled = true;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      input.value = result.title;
      savedTitle = result.title;
      input.setAttribute("aria-label", "Rename " + result.title);
      input.blur();
      button.classList.remove("book-title-save-visible");
      document.querySelectorAll(".book-tile-active").forEach((tile) => {
        tile.title = result.title;
        tile.setAttribute("aria-label", result.title);
      });
    } catch (error) {
      alert(error.message || "Could not rename book");
    } finally {
      button.disabled = false;
    }
  });
});

const editor = document.querySelector("[data-visual-editor]");
if (editor) {
  const canvas = editor.querySelector("[data-visual-content]");
  const source = editor.querySelector("[data-markdown-source]");
  const uploadInput = editor.querySelector("[data-upload-input]");
  const saveState = editor.querySelector("[data-save-state]");
  let savedRange;

  const renderedWrapper = canvas.firstElementChild;
  if (
    renderedWrapper?.classList.contains("rendered-markdown") &&
    canvas.children.length === 1
  ) {
    renderedWrapper.replaceWith(...renderedWrapper.childNodes);
  }
  const firstBlock = canvas.firstElementChild;
  const title = editor.querySelector('input[name="title"]');
  if (
    firstBlock?.tagName === "H1" &&
    firstBlock.textContent.trim() === title.value.trim()
  ) {
    firstBlock.remove();
  }

  const rememberRange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && canvas.contains(selection.anchorNode)) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreRange = () => {
    if (!savedRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };

  const escapeMarkdown = (value) =>
    value.replace(/([\\\\\`*_{}\\[\\]<>])/g, "\\\\$1");

  const inlineMarkdown = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return escapeMarkdown(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const inside = Array.from(node.childNodes).map(inlineMarkdown).join("");
    if (tag === "strong" || tag === "b") return "**" + inside + "**";
    if (tag === "em" || tag === "i") return "_" + inside + "_";
    if (tag === "code") return "\`" + inside + "\`";
    if (tag === "a") return "[" + inside + "](" + (node.getAttribute("href") || "") + ")";
    if (tag === "img") {
      return "![" + escapeMarkdown(node.getAttribute("alt") || "") + "](" +
        (node.getAttribute("src") || "") + ")";
    }
    if (tag === "br") return "\\n";
    return inside;
  };

  const blockMarkdown = (node, depth = 0) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      return "#".repeat(Number(tag[1])) + " " + inlineMarkdown(node);
    }
    if (tag === "blockquote") {
      return inlineMarkdown(node).split("\\n").map((line) => "> " + line).join("\\n");
    }
    if (tag === "pre") return "\\\`\\\`\\\`\\n" + (node.textContent || "") + "\\n\\\`\\\`\\\`";
    if (tag === "ul" || tag === "ol") {
      return Array.from(node.children).map((item, index) => {
        const marker = tag === "ol" ? (index + 1) + ". " : "- ";
        return "  ".repeat(depth) + marker + inlineMarkdown(item);
      }).join("\\n");
    }
    if (tag === "table") {
      const rows = Array.from(node.querySelectorAll("tr")).map((row) =>
        Array.from(row.children).map((cell) => inlineMarkdown(cell).trim()).join(" | ")
      );
      if (!rows.length) return "";
      const columns = node.querySelector("tr")?.children.length || 1;
      return "| " + rows[0] + " |\\n| " + Array(columns).fill("---").join(" | ") +
        " |" + rows.slice(1).map((row) => "\\n| " + row + " |").join("");
    }
    if (tag === "p" || tag === "div" || tag === "figure") return inlineMarkdown(node);
    return inlineMarkdown(node);
  };

  const syncMarkdown = () => {
    source.value = Array.from(canvas.childNodes)
      .map((node) => blockMarkdown(node))
      .filter(Boolean)
      .join("\\n\\n");
    saveState.textContent = "Unsaved";
  };

  const command = (name, value = null) => {
    restoreRange();
    document.execCommand(name, false, value);
    canvas.focus();
    rememberRange();
    syncMarkdown();
  };

  editor.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      const name = button.dataset.command;
      if (name === "createLink") {
        const url = prompt("Paste a link");
        if (url) command(name, url);
      } else command(name);
    });
  });

  editor.querySelector("[data-block-format]").addEventListener("change", (event) => {
    command("formatBlock", event.target.value);
  });
  editor.querySelector("[data-block]").addEventListener("click", (event) => {
    event.preventDefault();
    command("formatBlock", event.currentTarget.dataset.block);
  });
  editor.querySelector("[data-insert-table]").addEventListener("click", (event) => {
    event.preventDefault();
    restoreRange();
    document.execCommand("insertHTML", false,
      '<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead>' +
      '<tbody><tr><td>Value</td><td>Value</td></tr></tbody></table><p><br></p>');
    syncMarkdown();
  });

  editor.querySelector("[data-upload-trigger]").addEventListener("click", () => {
    rememberRange();
    uploadInput.click();
  });

  const upload = async (file) => {
    if (!file) return;
    const button = editor.querySelector("[data-upload-trigger]");
    const originalContent = button.innerHTML;
    button.textContent = "…";
    button.disabled = true;
    const data = new FormData();
    data.append("file", file);
    try {
      const response = await fetch(editor.dataset.uploadUrl, {
        method: "POST",
        headers: { accept: "application/json" },
        body: data,
      });
      if (!response.ok) throw new Error(await response.text());
      const asset = await response.json();
      restoreRange();
      const safeName = asset.name.replace(/[<>&"]/g, "");
      const html = asset.image
        ? '<figure><img src="' + asset.url + '" alt="' + safeName +
          '"><figcaption>' + safeName + '</figcaption></figure><p><br></p>'
        : '<p><a href="' + asset.url + '">' + safeName + '</a></p>';
      document.execCommand("insertHTML", false, html);
      syncMarkdown();
    } catch (error) {
      alert(error.message || "Upload failed");
    } finally {
      button.innerHTML = originalContent;
      button.disabled = false;
      uploadInput.value = "";
    }
  };
  uploadInput.addEventListener("change", () => upload(uploadInput.files[0]));

  canvas.addEventListener("input", syncMarkdown);
  canvas.addEventListener("keyup", rememberRange);
  canvas.addEventListener("mouseup", rememberRange);
  canvas.addEventListener("paste", (event) => {
    const image = Array.from(event.clipboardData?.files || [])
      .find((file) => file.type.startsWith("image/"));
    if (image) {
      event.preventDefault();
      rememberRange();
      upload(image);
    }
  });
  editor.addEventListener("submit", syncMarkdown);
}
`;
