export const clientScript = `
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
let searchTimer;
let searchController;
let searchIndex = 0;

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
      button.textContent = "＋";
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
