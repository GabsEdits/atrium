export const clientScript = `
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
let searchTimer;
let searchController;
let searchIndex = 0;

const settingsDialog = document.querySelector("[data-settings-dialog]");
const settingsDialogBody = document.querySelector("[data-settings-dialog-body]");
const confirmDialog = document.querySelector("[data-confirm-dialog]");
const toastStack = document.querySelector("[data-toast-stack]");

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
  ["toggle theme", "moon"],
  ["workspace settings", "settings"],
  ["account security", "shield-check"],
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
  "settings": '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /> <circle cx="12" cy="12" r="3" />',
  "qr-code": '<rect width="5" height="5" x="3" y="3" rx="1" /> <rect width="5" height="5" x="16" y="3" rx="1" /> <rect width="5" height="5" x="3" y="16" rx="1" /> <path d="M21 16h-3a2 2 0 0 0-2 2v3" /> <path d="M21 21v.01" /> <path d="M12 7v3a2 2 0 0 1-2 2H7" /> <path d="M3 12h.01" /> <path d="M12 3h.01" /> <path d="M12 16v.01" /> <path d="M16 12h1" /> <path d="M21 12v.01" /> <path d="M12 21v-1" />',
  "arrow-right": '<path d="M5 12h14" /> <path d="m12 5 7 7-7 7" />',
  "circle-plus": '<circle cx="12" cy="12" r="10" /> <path d="M8 12h8" /> <path d="M12 8v8" />',
  "key": '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /> <path d="m21 2-9.6 9.6" /> <circle cx="7.5" cy="15.5" r="5.5" />',
  "external-link": '<path d="M15 3h6v6" /> <path d="M10 14 21 3" /> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',
  "moon": '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
};

const buildIcon = (name) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"' +
    ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + iconPaths[name] + "</svg>";
  return wrapper.firstElementChild;
};

const showToast = (message, variant = "default") => {
  if (!toastStack) return;
  const toast = document.createElement("div");
  toast.className = "toast" + (variant === "error" ? " toast-error" : "");
  const dot = document.createElement("span");
  dot.className = "toast-dot";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(dot, text);
  toastStack.append(toast);
  setTimeout(() => toast.remove(), 4000);
};

let confirmAccept;
const closeConfirm = () => confirmDialog?.close();
if (confirmDialog) {
  confirmDialog.querySelector("[data-confirm-cancel]").addEventListener(
    "click",
    closeConfirm,
  );
  confirmDialog.querySelectorAll("[data-dialog-close]").forEach((button) =>
    button.addEventListener("click", closeConfirm)
  );
  confirmDialog.querySelector("[data-confirm-accept]").addEventListener(
    "click",
    () => {
      closeConfirm();
      confirmAccept?.();
    },
  );
  confirmDialog.addEventListener("click", (event) => {
    if (event.target === confirmDialog) closeConfirm();
  });
}
const showConfirm = (message, onAccept) => {
  if (!confirmDialog) {
    if (window.confirm(message || "Are you sure?")) onAccept();
    return;
  }
  confirmDialog.querySelector("[data-confirm-description]").textContent =
    message || "Are you sure?";
  confirmAccept = onAccept;
  confirmDialog.showModal();
};

const closeSettingsDialog = () => settingsDialog?.close();
if (settingsDialog) {
  settingsDialog.querySelectorAll("[data-dialog-close]").forEach((button) =>
    button.addEventListener("click", closeSettingsDialog)
  );
  settingsDialog.addEventListener("click", (event) => {
    if (event.target === settingsDialog) closeSettingsDialog();
  });
}
const openSettingsDialog = async (url) => {
  if (!settingsDialog || !settingsDialogBody) {
    window.location.assign(url);
    return;
  }
  try {
    const response = await fetch(url, {
      headers: { "x-atrium-fragment": "1" },
    });
    if (!response.ok) throw new Error("Could not load settings");
    settingsDialogBody.innerHTML = await response.text();
    settingsDialog.showModal();
  } catch {
    window.location.assign(url);
  }
};
document.querySelectorAll("[data-dialog-fetch]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openSettingsDialog(trigger.getAttribute("href"));
  });
});

document.querySelectorAll(
  "button, a.button, a.quiet-action, a.icon-button, summary.icon-button, " +
    ".rail-account-menu a, .page-menu-popover a",
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
    if (form.dataset.confirmed === "1") return;
    event.preventDefault();
    showConfirm(form.dataset.confirm, () => {
      form.dataset.confirmed = "1";
      form.requestSubmit();
    });
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

document.querySelectorAll(".tabs a").forEach((tab) => {
  tab.addEventListener("mouseenter", () => {
    fetch(tab.href, { credentials: "same-origin" }).catch(() => {});
  }, { once: true });
});

document.querySelectorAll(".global-search").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openSearch();
  });
});

document.addEventListener("keydown", (event) => {
  if (!(event.metaKey || event.ctrlKey)) return;
  const key = event.key.toLowerCase();
  if (key === "k") {
    event.preventDefault();
    openSearch();
  } else if (key === "s") {
    const editor = document.querySelector("[data-visual-editor]");
    if (editor) {
      event.preventDefault();
      editor.requestSubmit();
    }
  } else if (key === "e") {
    const toggle = document.querySelector("[data-edit-toggle]");
    if (toggle) {
      event.preventDefault();
      toggle.click();
    }
  }
});

const staticActions = [
  {
    id: "new-page",
    label: "New page",
    run: () =>
      document.querySelector('.document-panel form[action="/pages"] button')
        ?.click(),
  },
  {
    id: "new-book",
    label: "New book",
    run: () => document.querySelector(".rail-create button")?.click(),
  },
  {
    id: "account-security",
    label: "Account security",
    run: () => openSettingsDialog("/account/security"),
  },
  {
    id: "workspace-settings",
    label: "Workspace settings",
    run: () => openSettingsDialog("/settings/members"),
  },
  {
    id: "sign-out",
    label: "Sign out",
    run: () =>
      document.querySelector('.rail-account-menu form[action="/logout"] button')
        ?.click(),
  },
];
const matchesQuery = (label, query) =>
  !query || label.toLowerCase().includes(query.toLowerCase());

const RECENT_PAGES_KEY = "atrium-recent-pages";
const getRecentPages = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_PAGES_KEY) || "[]");
  } catch {
    return [];
  }
};
const recordRecentPage = () => {
  const match = location.pathname.match(/^\\/pages\\/(\\d+)$/);
  if (!match) return;
  const titleEl = document.querySelector(".breadcrumbs strong");
  if (!titleEl) return;
  const bookEl = document.querySelector(".breadcrumbs")?.firstElementChild;
  const entry = {
    pageId: Number(match[1]),
    title: titleEl.textContent.trim(),
    bookTitle: bookEl ? bookEl.textContent.trim() : "",
  };
  const list = getRecentPages().filter((item) => item.pageId !== entry.pageId);
  list.unshift(entry);
  try {
    localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {}
};
recordRecentPage();
const emptyQueryState = () => {
  const recent = getRecentPages();
  return recent.length
    ? { type: "recent", pages: recent }
    : { type: "message", text: "Type to search every page you can access." };
};

if (searchDialog && searchInput && searchResults) {
  const items = () => Array.from(
    searchResults.querySelectorAll("[data-search-item]")
  );
  const selectResult = (index) => {
    const list = items();
    if (!list.length) return;
    searchIndex = (index + list.length) % list.length;
    list.forEach((item, itemIndex) =>
      item.classList.toggle("search-dialog-result-active", itemIndex === searchIndex)
    );
    list[searchIndex].scrollIntoView({ block: "nearest" });
  };
  const attachHover = () => {
    items().forEach((item, index) =>
      item.addEventListener("mousemove", () => selectResult(index))
    );
  };
  const buildActionsSection = (query) => {
    const matches = staticActions.filter((action) =>
      matchesQuery(action.label, query)
    );
    if (!matches.length) return null;
    const section = document.createElement("div");
    section.className = "search-dialog-actions";
    matches.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-dialog-action";
      button.dataset.searchItem = "";
      const label = document.createElement("strong");
      label.textContent = action.label;
      button.append(label);
      button.addEventListener("click", () => {
        searchDialog.close();
        action.run();
      });
      section.append(button);
    });
    return section;
  };
  const appendResultLink = (section, result, withExcerpt) => {
    const link = document.createElement("a");
    link.href = "/pages/" + result.pageId;
    link.dataset.searchItem = "";
    link.dataset.searchResult = "";
    const path = document.createElement("span");
    path.textContent = result.bookTitle;
    const title = document.createElement("strong");
    title.textContent = result.title;
    link.append(path, title);
    if (withExcerpt) {
      const excerpt = document.createElement("small");
      excerpt.textContent = result.excerpt;
      link.append(excerpt);
    }
    section.append(link);
  };
  const buildResultsSection = (state) => {
    const section = document.createElement("div");
    if (state.type === "results" && state.results.length) {
      state.results.forEach((result) => appendResultLink(section, result, true));
      return section;
    }
    if (state.type === "recent" && state.pages.length) {
      const heading = document.createElement("p");
      heading.className = "search-dialog-heading";
      heading.textContent = "Recent";
      section.append(heading);
      state.pages.forEach((page) => appendResultLink(section, page, false));
      return section;
    }
    const paragraph = document.createElement("p");
    paragraph.textContent = state.type === "results"
      ? "No matching pages."
      : state.text;
    section.append(paragraph);
    return section;
  };
  const render = (query, pageState) => {
    searchResults.replaceChildren();
    const actionsSection = buildActionsSection(query);
    if (actionsSection) searchResults.append(actionsSection);
    searchResults.append(buildResultsSection(pageState));
    attachHover();
    selectResult(0);
  };
  render("", emptyQueryState());
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchController?.abort();
    const query = searchInput.value.trim();
    if (!query) {
      render(query, emptyQueryState());
      return;
    }
    render(query, { type: "message", text: "Searching…" });
    searchTimer = setTimeout(async () => {
      searchController = new AbortController();
      try {
        const response = await fetch("/api/search?q=" + encodeURIComponent(query), {
          headers: { accept: "application/json" },
          signal: searchController.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        render(query, {
          type: "results",
          results: (await response.json()).results,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          render(query, { type: "message", text: "Search is unavailable." });
        }
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
      const selected = items()[searchIndex];
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

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const root = document.documentElement;
    let current = root.getAttribute("data-theme");
    if (!current) {
      current = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("atrium-theme", next);
    } catch {
      // Storage may be unavailable (e.g. private browsing); the toggle
      // still works for the current page load.
    }
  });
});

document.querySelectorAll("[data-page-nav]").forEach((nav) => {
  const bookId = nav.dataset.bookId;
  let dragged = null;
  nav.querySelectorAll("a[data-page-id]").forEach((link) => {
    link.addEventListener("dragstart", (event) => {
      dragged = link;
      link.setAttribute("dragging", "");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", link.dataset.pageId);
    });
    link.addEventListener("dragend", () => {
      dragged?.removeAttribute("dragging");
      dragged = null;
    });
  });
  nav.addEventListener("dragover", (event) => {
    if (!dragged) return;
    event.preventDefault();
    const target = event.target.closest("a[data-page-id]");
    if (!target || target === dragged) return;
    const rect = target.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    nav.insertBefore(dragged, before ? target : target.nextSibling);
  });
  nav.addEventListener("drop", async (event) => {
    if (!dragged) return;
    event.preventDefault();
    const orderedIds = Array.from(nav.querySelectorAll("a[data-page-id]"))
      .map((link) => Number(link.dataset.pageId));
    try {
      const response = await fetch("/books/" + bookId + "/pages/reorder", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ pageIds: orderedIds }),
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      alert(error.message || "Could not reorder pages");
      window.location.reload();
    }
  });
});

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
      showToast(error.message || "Could not rename book", "error");
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

  let autosaveTimer;
  const scheduleAutosave = () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(autosave, 1500);
  };

  const autosave = async () => {
    saveState.textContent = "Saving…";
    try {
      const response = await fetch(editor.action, {
        method: "POST",
        headers: { accept: "application/json" },
        body: new FormData(editor),
      });
      if (!response.ok) throw new Error(await response.text());
      saveState.textContent = "Saved";
      setTimeout(() => {
        if (saveState.textContent === "Saved") saveState.textContent = "";
      }, 2000);
    } catch {
      saveState.textContent = "Save failed";
    }
  };

  const syncMarkdown = () => {
    const body = Array.from(canvas.childNodes)
      .map((node) => blockMarkdown(node))
      .filter(Boolean)
      .join("\\n\\n");
    const titleLine = title.value.trim()
      ? "# " + escapeMarkdown(title.value.trim())
      : "";
    source.value = titleLine ? titleLine + "\\n\\n" + body : body;
    saveState.textContent = "Unsaved";
    scheduleAutosave();
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
  const insertTable = () => {
    restoreRange();
    document.execCommand("insertHTML", false,
      '<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead>' +
      '<tbody><tr><td>Value</td><td>Value</td></tr></tbody></table><p><br></p>');
    syncMarkdown();
  };
  editor.querySelector("[data-insert-table]").addEventListener("click", (event) => {
    event.preventDefault();
    insertTable();
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

  title.addEventListener("input", syncMarkdown);

  const slashCommands = [
    { label: "Heading 2", run: () => command("formatBlock", "h2") },
    { label: "Heading 3", run: () => command("formatBlock", "h3") },
    { label: "Bulleted list", run: () => command("insertUnorderedList") },
    { label: "Quote", run: () => command("formatBlock", "blockquote") },
    { label: "Table", run: insertTable },
  ];

  const slashMenu = document.createElement("div");
  slashMenu.className = "slash-menu";
  slashMenu.hidden = true;
  editor.append(slashMenu);

  let slashActive = false;
  let slashBlock = null;
  let slashFiltered = [];
  let slashIndex = 0;

  const closeSlashMenu = () => {
    slashActive = false;
    slashBlock = null;
    slashMenu.hidden = true;
    slashMenu.replaceChildren();
  };

  const updateSlashActive = () => {
    Array.from(slashMenu.children).forEach((button, index) => {
      button.classList.toggle("slash-menu-active", index === slashIndex);
    });
  };

  const runSlashCommand = (item) => {
    const block = slashBlock;
    closeSlashMenu();
    if (!block) return;
    block.textContent = "";
    const range = document.createRange();
    range.selectNodeContents(block);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange = range.cloneRange();
    item.run();
    canvas.focus();
  };

  const renderSlashMenu = () => {
    slashMenu.replaceChildren();
    slashFiltered.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.label;
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => runSlashCommand(item));
      slashMenu.append(button);
    });
    slashIndex = 0;
    updateSlashActive();
    slashMenu.hidden = slashFiltered.length === 0;
  };

  const positionSlashMenu = (block) => {
    const rect = block.getBoundingClientRect();
    slashMenu.style.top = (rect.bottom + 4) + "px";
    slashMenu.style.left = rect.left + "px";
  };

  const handleSlashInput = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed) {
      return closeSlashMenu();
    }
    const node = selection.getRangeAt(0).startContainer;
    let block = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (block && block.parentElement !== canvas) block = block.parentElement;
    if (!block) return closeSlashMenu();
    const match = (block.textContent || "").match(/^\\/(\\S*)$/);
    if (!match) return closeSlashMenu();
    slashActive = true;
    slashBlock = block;
    const query = match[1].toLowerCase();
    slashFiltered = slashCommands.filter((item) =>
      item.label.toLowerCase().includes(query)
    );
    positionSlashMenu(block);
    renderSlashMenu();
  };

  canvas.addEventListener("input", () => {
    syncMarkdown();
    handleSlashInput();
  });
  canvas.addEventListener("keydown", (event) => {
    if (!slashActive || slashMenu.hidden) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      slashIndex = (slashIndex + 1) % slashFiltered.length;
      updateSlashActive();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      slashIndex = (slashIndex - 1 + slashFiltered.length) % slashFiltered.length;
      updateSlashActive();
    } else if (event.key === "Enter") {
      const item = slashFiltered[slashIndex];
      if (item) {
        event.preventDefault();
        runSlashCommand(item);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeSlashMenu();
    }
  });
  canvas.addEventListener("blur", () => closeSlashMenu());
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
