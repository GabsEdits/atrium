# Production

Atrium keeps its zero-config local defaults, while production settings are
supplied through environment variables. See `.env.example`.

## Minimum deployment

Run one Atrium process behind an HTTPS reverse proxy and persist the complete
`ATRIUM_DATA_DIR`. Set:

- `ATRIUM_BASE_URL` to the externally visible HTTPS origin.
- `ATRIUM_SECURE_COOKIES=true`.
- `ATRIUM_DATA_DIR` to a persistent volume.
- `ATRIUM_RESEND_API_KEY` and `ATRIUM_MAIL_FROM` for invitation and password
  recovery email.

## Single sign-on

Set the OIDC issuer, client ID, and client secret together. Register
`https://your-atrium.example/auth/oidc/callback` as the exact redirect URI.
Atrium discovers provider endpoints, uses authorization code flow with PKCE S256
and state validation, and requests `openid email profile`.

By default, SSO signs in only existing Atrium email addresses. Set
`ATRIUM_OIDC_AUTO_PROVISION=true` to allow verified-email identities to join the
first workspace as readers. Keep this disabled for invite-only systems.

Do not expose the SQLite database, asset directory, backups, or application
stdout publicly. Recovery links are logged only when email delivery is not
configured.

## Dokploy

Use `compose.yaml` and set `ATRIUM_BASE_URL` to the domain configured in
Dokploy. The included named volume mounts at `/data`, which is the recommended
Dokploy option for databases and enables Dokploy volume backups.

The container starts briefly as root only to repair ownership on `/data`, then
drops to the image's unprivileged `deno` user before launching Atrium. This also
repairs volumes created by an earlier image where `/data` was root-owned.

If deploying Atrium as a single Dokploy Application instead of Compose, add a
Volume Mount with container path `/data`. Do not use an absolute host bind path.
Set the same environment variables shown in `.env.example`, then rebuild the
image rather than only restarting the old container.

## Backups

```sh
ATRIUM_DATA_DIR=/data deno task backup /backups
```

The command checkpoints SQLite, copies the database and uploaded assets, and
writes a versioned manifest. Test restores regularly by starting Atrium against
a copy of the resulting directory.

For consistent automated backups, briefly stop writes or run the backup command
in the same container/process environment. Retain multiple generations outside
the primary host.

## Reverse proxy

The proxy must preserve the original host and scheme. Atrium compares mutation
origins with `ATRIUM_BASE_URL`, uses HTTP-only SameSite cookies, and enables the
Secure cookie flag for HTTPS deployments.

Apply request-body limits at the proxy as well as Atrium's 10 MB upload limit.
Only a single Atrium process should write to a SQLite database. Larger
multi-instance deployments will require a future PostgreSQL storage adapter.
