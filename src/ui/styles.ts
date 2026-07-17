export const styles = `
:root {
  color-scheme: light;
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  --background: #fafafa;
  --surface: #ffffff;
  --surface-subtle: #f5f5f5;
  --foreground: #18181b;
  --muted: #71717a;
  --muted-light: #a1a1aa;
  --border: rgba(0, 0, 0, .08);
  --border-strong: rgba(0, 0, 0, .13);
  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --accent-soft: rgba(79, 70, 229, .08);
  --private: #f59e0b;
  --public: #10b981;
  --unlisted: #71717a;
  --radius-sm: .4rem;
  --radius-md: .6rem;
  --radius-lg: .8rem;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, .04);
}
* { box-sizing: border-box; }
html { font-family: var(--font-sans); color: var(--foreground); background: var(--background); }
body { margin: 0; min-height: 100vh; }
button, input, textarea, select { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button { color: inherit; }
a { color: inherit; text-decoration: none; }
.landing-body { display: grid; place-items: center; padding: 2rem; }
.welcome { width: min(100%, 38rem); }
.brand-mark {
  display: grid; width: 2.75rem; height: 2.75rem; place-items: center;
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  background: var(--surface); box-shadow: var(--shadow-sm); font-weight: 700;
}
.brand-mark-small { width: 1.8rem; height: 1.8rem; border-radius: .5rem; font-size: .8rem; }
.welcome h1 {
  margin: 2.75rem 0 1.25rem; font-size: clamp(3rem, 9vw, 5.5rem);
  letter-spacing: -.07em; line-height: .92; font-weight: 650;
}
.eyebrow {
  margin: 0 0 .7rem; color: var(--accent); font-size: .72rem;
  font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
}
.lead { max-width: 33rem; color: var(--muted); font-size: 1.12rem; line-height: 1.7; }
.button {
  display: inline-flex; min-height: 2.4rem; align-items: center; justify-content: center;
  border: 1px solid transparent; border-radius: var(--radius-md); padding: .55rem .9rem;
  cursor: pointer; font-size: .86rem; font-weight: 600; transition: .15s ease;
}
.button-primary { color: white; background: var(--foreground); box-shadow: var(--shadow-sm); }
.button-primary:hover { background: #303036; transform: translateY(-1px); }
.button-secondary { border-color: var(--border-strong); background: var(--surface); }
.button-secondary:hover { background: var(--surface-subtle); }
.button-full { width: 100%; margin-top: .25rem; }
.welcome .button { margin-top: 1.4rem; }
.hint { margin-top: 1rem; color: var(--muted-light); font-size: .78rem; }
.auth-body { display: grid; min-height: 100vh; place-items: center; padding: 2rem; }
.auth-shell { width: min(100%, 25rem); }
.wordmark { display: inline-flex; align-items: center; gap: .65rem; font-size: .9rem; font-weight: 650; }
.auth-shell > .wordmark { margin-bottom: 1.5rem; }
.auth-card {
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 2rem; background: var(--surface); box-shadow: var(--shadow-sm);
}
.auth-heading h1 { margin: 0; font-size: 1.55rem; letter-spacing: -.035em; }
.auth-heading > p:last-child { margin: .6rem 0 1.5rem; color: var(--muted); font-size: .88rem; line-height: 1.55; }
.form-stack { display: grid; gap: 1rem; }
.form-stack label { display: grid; gap: .45rem; color: #3f3f46; font-size: .8rem; font-weight: 550; }
.form-stack input {
  width: 100%; height: 2.55rem; border: 1px solid var(--border-strong);
  border-radius: var(--radius-md); padding: 0 .75rem; color: var(--foreground);
  background: var(--surface); outline: none; box-shadow: var(--shadow-sm);
}
.form-stack input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.form-stack small { color: var(--muted); font-weight: 400; }
.alert {
  margin: 0 0 1.2rem; border: 1px solid #fecaca; border-radius: var(--radius-md);
  padding: .7rem .8rem; color: #991b1b; background: #fef2f2; font-size: .8rem;
}
.auth-footer { text-align: center; color: var(--muted-light); font-size: .72rem; margin-top: 1.25rem; }
.app-body { overflow: hidden; background: var(--surface); }
.app-shell { display: grid; min-height: 100vh; grid-template-columns: 17rem minmax(0, 1fr); }
.sidebar {
  display: flex; min-height: 100vh; flex-direction: column;
  border-right: 1px solid var(--border); background: var(--background);
}
.sidebar-header { display: flex; height: 3.75rem; align-items: center; justify-content: space-between; padding: 0 1rem; }
.icon-button {
  display: grid; width: 2rem; height: 2rem; place-items: center; border: 0;
  border-radius: var(--radius-sm); color: var(--muted); background: transparent; cursor: pointer;
}
.icon-button:hover { color: var(--foreground); background: var(--surface-subtle); }
.workspace-switcher {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .65rem;
  margin: .4rem .75rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: .55rem; text-align: left; background: var(--surface); box-shadow: var(--shadow-sm); cursor: pointer;
}
.workspace-avatar, .user-avatar {
  display: grid; width: 1.8rem; height: 1.8rem; place-items: center; border-radius: .45rem;
  color: white; background: var(--accent); font-size: .72rem; font-weight: 700;
}
.workspace-switcher strong, .workspace-switcher small { display: block; }
.workspace-switcher strong { font-size: .78rem; }
.workspace-switcher small { margin-top: .1rem; color: var(--muted); font-size: .65rem; text-transform: capitalize; }
.chevron { color: var(--muted); }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 0 .75rem; }
.nav-item, .page-link {
  display: flex; align-items: center; gap: .65rem; border-radius: var(--radius-sm);
  padding: .45rem .55rem; color: var(--muted); font-size: .78rem;
}
.nav-item:hover, .page-link:hover, .nav-item-active, .page-link-active {
  color: var(--foreground); background: var(--accent-soft);
}
.nav-separator { height: 1px; margin: 1rem .45rem; background: var(--border); }
.nav-label {
  display: flex; align-items: center; justify-content: space-between; padding: 0 .5rem .55rem;
  color: var(--muted-light); font-size: .65rem; font-weight: 650; letter-spacing: .08em; text-transform: uppercase;
}
.nav-label button { border: 0; color: var(--muted); background: none; cursor: pointer; }
.inline-create { display: inline-flex; margin: 0; }
.inline-create button {
  border: 0; padding: 0 .2rem; color: var(--muted); background: transparent;
  cursor: pointer;
}
.nav-group { margin-bottom: .85rem; }
.nav-group-heading {
  display: flex; align-items: center; justify-content: space-between; padding: .4rem .55rem;
  font-size: .73rem; font-weight: 650;
}
.page-link { padding-left: .75rem; }
.page-icon { color: var(--muted-light); }
.visibility-dot { width: .42rem; height: .42rem; border-radius: 50%; background: var(--unlisted); }
.visibility-private { background: var(--private); }
.visibility-public { background: var(--public); }
.visibility-unlisted { background: var(--unlisted); }
.sidebar-footer {
  display: flex; align-items: center; gap: .6rem; border-top: 1px solid var(--border); padding: .8rem 1rem;
}
.user-avatar { border-radius: 50%; color: var(--foreground); background: var(--surface-subtle); }
.user-details { min-width: 0; flex: 1; }
.user-details strong, .user-details span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-details strong { font-size: .72rem; }
.user-details span { margin-top: .1rem; color: var(--muted); font-size: .62rem; }
.content-shell { min-width: 0; min-height: 100vh; background: var(--surface); }
.topbar {
  display: flex; height: 3.75rem; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border); padding: 0 1.5rem;
}
.breadcrumbs { display: flex; gap: .55rem; color: var(--muted); font-size: .76rem; }
.breadcrumbs strong { color: var(--foreground); font-weight: 550; }
.topbar-actions { display: flex; align-items: center; gap: .55rem; }
.visibility-badge {
  display: inline-flex; align-items: center; gap: .4rem; border: 1px solid var(--border);
  border-radius: 999px; padding: .35rem .6rem; color: var(--muted); font-size: .68rem; text-transform: capitalize;
}
.document { width: min(100% - 3rem, 47rem); margin: 0 auto; padding: 6rem 0 8rem; }
.document-meta { display: flex; align-items: center; gap: .55rem; color: var(--muted); font-size: .72rem; }
.document-icon { display: grid; width: 1.7rem; height: 1.7rem; place-items: center; border-radius: .4rem; background: var(--accent-soft); color: var(--accent); }
.document h1 { margin: 1.4rem 0 1rem; font-size: 2.75rem; letter-spacing: -.055em; line-height: 1.08; }
.document-lead { color: var(--muted); font-size: 1.08rem; line-height: 1.7; }
.document hr { margin: 2.5rem 0; border: 0; border-top: 1px solid var(--border); }
.document h2 { margin: 0 0 .75rem; font-size: 1.3rem; letter-spacing: -.025em; }
.document p { color: #52525b; line-height: 1.7; }
.callout {
  display: flex; gap: .8rem; margin-top: 1.5rem; border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1rem; background: var(--background);
}
.callout > span { color: var(--accent); }
.callout strong { font-size: .82rem; }
.callout p { margin: .25rem 0 0; color: var(--muted); font-size: .78rem; }
.rendered-markdown h1 { margin-top: 0; }
.rendered-markdown h2, .rendered-markdown h3 { margin-top: 2rem; letter-spacing: -.025em; }
.rendered-markdown p, .rendered-markdown li { color: #52525b; line-height: 1.75; }
.rendered-markdown code {
  border: 1px solid var(--border); border-radius: .3rem; padding: .1rem .3rem;
  background: var(--surface-subtle); font-family: ui-monospace, monospace; font-size: .86em;
}
.rendered-markdown pre { overflow: auto; border-radius: var(--radius-lg); padding: 1rem; background: var(--surface-subtle); }
.rendered-markdown pre code { border: 0; padding: 0; }
.updated-at { margin-top: 4rem; color: var(--muted-light) !important; font-size: .7rem; }
.editor { min-height: 100vh; }
.editor-toolbar {
  display: flex; height: 3.75rem; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border); padding: 0 1rem;
}
.editor-actions { display: flex; align-items: center; gap: .6rem; }
.visibility-control {
  display: grid; gap: .15rem; color: var(--muted); font-size: .58rem;
  font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
}
.editor-actions select {
  height: 1.65rem; border: 1px solid var(--border-strong); border-radius: var(--radius-sm);
  padding: 0 .4rem; color: var(--foreground); background: var(--surface);
  font-size: .68rem; text-transform: capitalize;
}
.editor-grid { display: grid; height: calc(100vh - 3.75rem); grid-template-columns: 1fr 1fr; }
.editor-pane { display: flex; min-width: 0; flex-direction: column; border-right: 1px solid var(--border); }
.title-input {
  height: 4.5rem; border: 0; border-bottom: 1px solid var(--border); padding: 0 1.5rem;
  color: var(--foreground); background: var(--surface); outline: none;
  font-size: 1.35rem; font-weight: 650; letter-spacing: -.025em;
}
.format-toolbar {
  display: flex; min-height: 2.6rem; align-items: center; gap: .15rem;
  border-bottom: 1px solid var(--border); padding: .35rem .75rem;
  background: var(--background);
}
.format-toolbar button {
  display: grid; width: 1.9rem; height: 1.8rem; place-items: center; border: 0;
  border-radius: var(--radius-sm); color: var(--muted); background: transparent;
  cursor: pointer; font-size: .72rem;
}
.format-toolbar button:hover, .format-toolbar button:focus-visible {
  color: var(--foreground); background: var(--accent-soft); outline: none;
}
.format-toolbar > span { width: 1px; height: 1rem; margin: 0 .25rem; background: var(--border); }
.editor-pane textarea {
  width: 100%; min-height: 0; flex: 1; resize: none; border: 0; padding: 1.5rem;
  color: var(--foreground); background: var(--surface); outline: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .86rem; line-height: 1.7;
}
.preview-pane { min-width: 0; overflow-y: auto; background: var(--background); }
.preview-label {
  position: sticky; top: 0; border-bottom: 1px solid var(--border); padding: .5rem 1rem;
  color: var(--muted); background: var(--background); font-size: .66rem; text-transform: uppercase;
}
.document-preview { width: min(100% - 3rem, 42rem); padding-top: 3rem; }
.editor-alert { position: fixed; z-index: 2; top: 4.5rem; left: 50%; transform: translateX(-50%); }
.rendered-markdown table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
.rendered-markdown th, .rendered-markdown td { border: 1px solid var(--border); padding: .6rem .75rem; text-align: left; }
.rendered-markdown th { background: var(--surface-subtle); font-size: .8rem; }
.public-header {
  display: flex; height: 3.75rem; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border); padding: 0 max(1.5rem, calc((100% - 47rem) / 2));
  color: var(--muted); background: var(--surface); font-size: .76rem;
}
.public-document { min-height: calc(100vh - 3.75rem); background: var(--surface); }
.upload-bar {
  display: flex; align-items: center; justify-content: flex-end; gap: .7rem;
  border-bottom: 1px solid var(--border); padding: .55rem 1.5rem; background: var(--background);
}
.upload-bar label { display: flex; align-items: center; gap: .6rem; color: var(--muted); font-size: .7rem; }
.settings-topbar {
  display: grid; height: 3.75rem; grid-template-columns: 1fr auto 1fr;
  align-items: center; border-bottom: 1px solid var(--border); padding: 0 1.5rem;
  color: var(--muted); background: var(--surface); font-size: .72rem;
}
.settings-topbar > :last-child { justify-self: end; }
.settings-page { width: min(100% - 2rem, 58rem); margin: 0 auto; padding: 4rem 0 8rem; }
.settings-heading { display: flex; align-items: start; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
.settings-heading h1, .standalone-card h1 { margin: 0; font-size: 2rem; letter-spacing: -.045em; }
.settings-heading p:not(.eyebrow), .standalone-card p { color: var(--muted); line-height: 1.6; }
.settings-card, .success-card, .standalone-card {
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.25rem; background: var(--surface); box-shadow: var(--shadow-sm);
}
.settings-card + .settings-card, .success-card + .settings-card { margin-top: 1rem; }
.settings-card h2 { margin: 0 0 1rem; font-size: .9rem; }
.inline-form { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: .6rem; }
.inline-form input, .inline-form select, .success-card input, .standalone-card input,
.search-form input, .member-row select {
  min-height: 2.4rem; border: 1px solid var(--border-strong); border-radius: var(--radius-md);
  padding: 0 .7rem; color: var(--foreground); background: var(--surface);
}
.success-card { margin-bottom: 1rem; border-color: rgba(16,185,129,.35); background: rgba(16,185,129,.06); }
.success-card p { color: var(--muted); font-size: .8rem; }
.success-card input { width: 100%; }
.member-row, .revision-row {
  display: flex; align-items: center; gap: .75rem; border-top: 1px solid var(--border); padding: .8rem 0;
}
.member-row:first-of-type, .revision-row:first-of-type { border-top: 0; }
.member-copy, .revision-row > div { min-width: 0; flex: 1; }
.member-copy strong, .member-copy span, .revision-row strong, .revision-row span { display: block; }
.member-copy strong, .revision-row strong { font-size: .8rem; }
.member-copy span, .revision-row span { margin-top: .15rem; color: var(--muted); font-size: .68rem; }
.member-row form { display: flex; gap: .4rem; }
.button-danger { border-color: rgba(239,68,68,.25); color: #dc2626; background: transparent; }
.you-label { width: 4rem; text-align: center; color: var(--muted); font-size: .68rem; }
.invitation-shell { width: min(100%, 27rem); }
.search-form { display: grid; grid-template-columns: 1fr auto; gap: .6rem; margin-bottom: 1.5rem; }
.search-form input { height: 3rem; font-size: 1rem; }
.search-results { display: grid; gap: .6rem; }
.search-result {
  display: grid; border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1rem; background: var(--surface);
}
.search-result:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
.search-result > span { color: var(--muted); font-size: .65rem; }
.search-result > strong { margin-top: .25rem; font-size: .9rem; }
.search-result p { margin: .45rem 0 0; color: var(--muted); font-size: .76rem; line-height: 1.5; }
.standalone-card { width: min(100%, 32rem); }
.standalone-card input, .standalone-card textarea { width: 100%; margin: .7rem 0 1.25rem; }
.standalone-card textarea { min-height: 6rem; padding: .7rem; }
.form-link { justify-self: center; color: var(--muted); font-size: .75rem; }
.security-status { display: flex; align-items: center; gap: .5rem; }
.secret-code, .uri-code {
  display: block; overflow-wrap: anywhere; border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: .8rem; background: var(--surface-subtle);
}
.uri-code { margin-top: .5rem; font-size: .68rem; }
.mfa-form { margin-top: 1rem; grid-template-columns: 1fr auto; }
.auth-divider { display: flex; align-items: center; gap: .7rem; margin: 1rem 0; color: var(--muted); font-size: .7rem; }
.auth-divider::before, .auth-divider::after { height: 1px; flex: 1; background: var(--border); content: ""; }
.recovery-codes { margin-bottom: 1rem; }
.recovery-codes pre {
  columns: 2; margin: .8rem 0 0; color: var(--foreground);
  font-family: ui-monospace, monospace; line-height: 1.8;
}
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark; --background: #09090b; --surface: #111113;
    --surface-subtle: #18181b; --foreground: #f4f4f5; --muted: #a1a1aa;
    --muted-light: #71717a; --border: rgba(255,255,255,.08);
    --border-strong: rgba(255,255,255,.14); --accent: #818cf8;
    --accent-soft: rgba(129,140,248,.13);
  }
  .button-primary { color: #09090b; background: #f4f4f5; }
  .button-primary:hover { background: #d4d4d8; }
  .form-stack label, .document p, .rendered-markdown p, .rendered-markdown li { color: #d4d4d8; }
  .alert { border-color: #7f1d1d; color: #fecaca; background: #450a0a; }
}
@media (max-width: 760px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .topbar { padding: 0 1rem; }
  .visibility-badge { display: none; }
  .document { width: min(100% - 2rem, 47rem); padding-top: 3.5rem; }
  .document h1 { font-size: 2.2rem; }
  .editor-grid { grid-template-columns: 1fr; }
  .preview-pane { display: none; }
}
`;
