# Atrium

Modern knowledge spaces powered by Steno.

Atrium is an easy-to-run CMS for public documentation, private team knowledge,
and sites that combine both. Steno provides its content rendering core.

## Start

```sh
deno task dev
```

Then open <http://localhost:3000>. On first run, Atrium creates `.atrium/`,
opens a local SQLite database, and guides you through creating the owner and
first workspace.

The current foundation includes secure password hashing, server-side sessions,
private-by-default workspaces, books and pages, and the authenticated
application shell. Owners and editors can create books and pages, edit Markdown
beside a Steno-powered preview, change visibility, and retain revisions on every
save. A formatting toolbar covers headings, emphasis, links, lists, quotes,
code, and tables for people who do not write Markdown directly.

Public delivery is allowed only when the workspace, book, and page are all
public. Private content remains behind authenticated membership checks and is
not returned from public URLs.

## Included

- Owner, editor, and reader roles with invitation-based membership.
- Public, private, and 30-day unlisted page delivery.
- Password recovery, TOTP multi-factor authentication, and optional OIDC SSO.
- Search scoped to each member's workspaces.
- Page history with one-click restoration.
- Permission-aware image, PDF, and text-file uploads.
- SQLite storage, automatic schema upgrades, and portable backups.
- Optional recovery email delivery through Resend.
- Docker and reverse-proxy production guidance.

See [docs/production.md](docs/production.md) before exposing Atrium to a
network.

## Principles

- Useful with one command and no configuration.
- Private by default during setup.
- Visibility can be selected per space, book, and page.
- Private content never enters public builds or public search indexes.
- Markdown remains portable and Steno remains the rendering authority.
