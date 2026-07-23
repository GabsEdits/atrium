import type {
  Member,
  PageDetail,
  PageRevision,
  SearchResult,
  User,
  WorkspaceOverview,
} from "../store.ts";
import { escapeHtml, page } from "./shared.ts";

export function renderMembers(
  user: User,
  workspace: WorkspaceOverview,
  members: Member[],
  inviteUrl?: string,
  error?: string,
  inviteDelivered = false,
): string {
  return page(
    `Members · ${workspace.name}`,
    shell(
      user,
      workspace,
      `<div class="settings-page">
        <header class="settings-heading">
          <div><p class="eyebrow">Workspace settings</p><h1>Members</h1>
            <p>Invite people and choose what they can do.</p></div>
          <a class="button button-secondary" href="/">Done</a>
        </header>
        ${error ? `<div class="alert">${escapeHtml(error)}</div>` : ""}
        ${
        inviteUrl
          ? `<div class="success-card"><strong>${
            inviteDelivered ? "Invitation emailed" : "Invitation ready"
          }</strong>
              <p>${
            inviteDelivered
              ? "The email was sent. You can also copy this private link."
              : "Send this private link to the invited person. It expires in 7 days."
          }</p>
              <input readonly value="${
            escapeHtml(inviteUrl)
          }" aria-label="Invitation link"></div>`
          : ""
      }
        <section class="settings-card">
          <h2>Invite someone</h2>
          <form method="post" action="/invitations" class="inline-form">
            <input type="email" name="email" placeholder="person@example.com"
              aria-label="Email to invite" required>
            <select name="role" aria-label="Invited role">
              <option value="editor">Editor</option>
              <option value="reader">Reader</option>
            </select>
            <button class="button button-primary" type="submit">Create invitation</button>
          </form>
        </section>
        <section class="settings-card member-list">
          <h2>People with access</h2>
          ${
        members.map((member) => `
            <div class="member-row">
              <div class="user-avatar">${
          escapeHtml(member.name.charAt(0))
        }</div>
              <div class="member-copy"><strong>${
          escapeHtml(member.name)
        }</strong>
                <span>${escapeHtml(member.email)}</span></div>
              <form method="post" action="/members/${member.userId}/role">
                <select name="role" aria-label="Role for ${
          escapeHtml(member.name)
        }">
                  ${roleOptions(member.role)}
                </select>
                <button class="button button-secondary">Update</button>
              </form>
              ${
          member.userId !== user.id
            ? `<form method="post" action="/members/${member.userId}/remove">
                  <button class="button button-danger" type="submit">Remove</button>
                </form>`
            : '<span class="you-label">You</span>'
        }
            </div>`).join("")
      }
        </section>
      </div>`,
    ),
    "app-body",
  );
}

export function renderInvitation(
  token: string,
  invitation: { email: string; role: string; workspaceName: string },
  error?: string,
): string {
  return page(
    `Join ${invitation.workspaceName} · Atrium`,
    `<div class="auth-shell invitation-shell">
      <a class="wordmark" href="/"><span class="brand-mark brand-mark-small">A</span>
        <span>Atrium</span></a>
      <main class="auth-card">
        <div class="auth-heading"><p class="eyebrow">Invitation</p>
          <h1>Join ${escapeHtml(invitation.workspaceName)}.</h1>
          <p>You’ve been invited as ${escapeHtml(invitation.role)} using
            ${escapeHtml(invitation.email)}.</p></div>
        ${error ? `<div class="alert">${escapeHtml(error)}</div>` : ""}
        <form method="post" action="/invite/${
      escapeHtml(token)
    }" class="form-stack">
          <label><span>Your name</span><input name="name" required autofocus></label>
          <label><span>Password</span><input name="password" type="password"
            minlength="12" autocomplete="new-password" required>
            <small>At least 12 characters.</small></label>
          <button class="button button-primary button-full">Create account</button>
        </form>
      </main>
    </div>`,
    "auth-body",
  );
}

export function renderExistingInvitation(
  token: string,
  invitation: { role: string; workspaceName: string },
): string {
  return page(
    `Join ${invitation.workspaceName} · Atrium`,
    `<main class="standalone-card">
      <p class="eyebrow">Invitation</p>
      <h1>Join ${escapeHtml(invitation.workspaceName)}.</h1>
      <p>This invitation grants you ${escapeHtml(invitation.role)} access.</p>
      <form method="post" action="/invite/${escapeHtml(token)}">
        <input type="hidden" name="acceptExisting" value="1">
        <button class="button button-primary">Accept invitation</button>
      </form>
    </main>`,
    "auth-body",
  );
}

export function renderRevisions(
  user: User,
  workspace: WorkspaceOverview,
  document: PageDetail,
  revisions: PageRevision[],
): string {
  return page(
    `History · ${document.title}`,
    shell(
      user,
      workspace,
      `<div class="settings-page">
        <header class="settings-heading"><div><p class="eyebrow">Page history</p>
          <h1>${escapeHtml(document.title)}</h1>
          <p>Restore any previously saved version.</p></div>
          <a class="button button-secondary" href="/pages/${document.id}">Back to page</a>
        </header>
        <section class="settings-card revision-list">
          ${
        revisions.length === 0
          ? "<p>No previous revisions yet.</p>"
          : revisions.map((revision) => `
            <div class="revision-row">
              <div><strong>${escapeHtml(revision.title)}</strong>
                <span>${escapeHtml(revision.createdAt)} · ${
            escapeHtml(revision.authorName)
          } · ${escapeHtml(revision.visibility)}</span></div>
              <form method="post" action="/pages/${document.id}/revisions/${revision.id}/restore">
                <button class="button button-secondary">Restore</button>
              </form>
            </div>`).join("")
      }
        </section>
      </div>`,
    ),
    "app-body",
  );
}

export function renderSearch(
  user: User,
  workspace: WorkspaceOverview,
  query: string,
  results: SearchResult[],
): string {
  return page(
    `Search · Atrium`,
    shell(
      user,
      workspace,
      `<div class="settings-page">
        <header class="settings-heading"><div><p class="eyebrow">Knowledge search</p>
          <h1>Search</h1></div><a class="button button-secondary" href="/">Done</a></header>
        <form class="search-form" action="/search">
          <input type="search" name="q" value="${escapeHtml(query)}"
            placeholder="Search every page…" aria-label="Search query" autofocus>
          <button class="button button-primary">Search</button>
        </form>
        <div class="search-results">
          ${query && results.length === 0 ? "<p>No matching pages.</p>" : ""}
          ${
        results.map((result) => `
            <a class="search-result" href="/pages/${result.pageId}">
              <span>${escapeHtml(result.bookTitle)}</span>
              <strong>${escapeHtml(result.title)}</strong>
              <p>${escapeHtml(result.excerpt)}</p>
            </a>`).join("")
      }
        </div>
      </div>`,
    ),
    "app-body",
  );
}

export function renderShareCreated(
  document: PageDetail,
  shareUrl: string,
): string {
  return page(
    `Share ${document.title} · Atrium`,
    `<main class="standalone-card">
      <p class="eyebrow">Unlisted share</p><h1>Private link created.</h1>
      <p>Anyone with this link can read the page for 30 days. It is not
        included in public navigation.</p>
      <input readonly value="${
      escapeHtml(shareUrl)
    }" aria-label="Unlisted share link">
      <div><a class="button button-primary" href="/pages/${document.id}">Back to page</a></div>
    </main>`,
    "auth-body",
  );
}

export function renderAssetCreated(
  document: PageDetail,
  assetUrl: string,
  isImage: boolean,
): string {
  const markdown = `${isImage ? "!" : ""}[description](${assetUrl})`;
  return page(
    `Upload · ${document.title}`,
    `<main class="standalone-card">
      <p class="eyebrow">Upload complete</p><h1>Add it to your page.</h1>
      <p>Copy this into the editor where the image or file should appear.</p>
      <textarea readonly aria-label="Asset Markdown">${
      escapeHtml(markdown)
    }</textarea>
      <div><a class="button button-primary" href="/pages/${document.id}/edit">Return to editor</a></div>
    </main>`,
    "auth-body",
  );
}

export function renderAssets(
  user: User,
  workspace: WorkspaceOverview,
  document: PageDetail,
  assets: Array<{
    id: number;
    originalName: string;
    mimeType: string;
    size: number;
  }>,
): string {
  return page(
    `Assets · ${document.title}`,
    shell(
      user,
      workspace,
      `<div class="settings-page">
        <header class="settings-heading"><div><p class="eyebrow">Page assets</p>
          <h1>${escapeHtml(document.title)}</h1>
          <p>Upload images and files, then copy their Markdown into the editor.</p></div>
          <a class="button button-secondary" href="/pages/${document.id}">Back to page</a>
        </header>
        <section class="settings-card">
          <form method="post" enctype="multipart/form-data"
            action="/pages/${document.id}/assets" class="inline-form">
            <input name="file" type="file" aria-label="File to upload" required>
            <button class="button button-primary">Upload</button>
          </form>
        </section>
        <section class="settings-card asset-list">
          <h2>Uploaded files</h2>
          ${
        assets.length === 0
          ? "<p>No files uploaded yet.</p>"
          : assets.map((asset) => `
            <div class="member-row">
              <div class="member-copy"><strong>${
            escapeHtml(asset.originalName)
          }</strong>
                <span>${escapeHtml(asset.mimeType)} · ${
            formatBytes(asset.size)
          }</span></div>
              <a class="button button-secondary"
                href="/files/${asset.id}/${
            encodeURIComponent(asset.originalName)
          }">Open</a>
              <form method="post" action="/assets/${asset.id}/delete">
                <button class="button button-danger">Delete</button>
              </form>
            </div>`).join("")
      }
        </section>
      </div>`,
    ),
    "app-body",
  );
}

function shell(
  user: User,
  workspace: WorkspaceOverview,
  content: string,
): string {
  return `<header class="settings-topbar">
      <a class="wordmark" href="/"><span class="brand-mark brand-mark-small">A</span>
        <span>Atrium</span></a>
      <span>${escapeHtml(workspace.name)}</span>
      <span>${escapeHtml(user.name)}</span>
    </header><main>${content}</main>`;
}

function roleOptions(selected: string): string {
  return ["owner", "editor", "reader"].map((role) =>
    `<option value="${role}" ${role === selected ? "selected" : ""}>${
      role.charAt(0).toUpperCase() + role.slice(1)
    }</option>`
  ).join("");
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
