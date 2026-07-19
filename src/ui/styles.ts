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
  gap: .45rem; border: 1px solid transparent; border-radius: var(--radius-md);
  padding: .55rem .9rem; cursor: pointer; font-size: .8rem; font-weight: 600;
  line-height: 1; transition: .15s ease;
}
.button .ph { font-size: 1rem; }
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
  display: inline-grid; width: 2rem; height: 2rem; place-items: center;
  border: 1px solid transparent; border-radius: var(--radius-sm);
  color: var(--muted); background: transparent; cursor: pointer;
}
.icon-button:hover { color: var(--foreground); background: var(--surface-subtle); }
.icon-button .ph { font-size: 1rem; }
button:focus-visible, .button:focus-visible, .icon-button:focus-visible,
.quiet-action:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
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
.rendered-markdown img {
  display: block; max-width: 100%; height: auto; border-radius: var(--radius-lg);
}
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
/* Atrium's document-first workspace */
.atrium-shell {
  display: grid; height: 100vh; min-height: 0;
  grid-template-columns: 5.25rem 14rem minmax(0, 1fr);
}
.book-rail {
  position: relative; z-index: 30; display: flex; height: 100vh;
  flex-direction: column; align-items: center; border-right: 1px solid var(--border);
  padding: .65rem .55rem; background: var(--background);
}
.rail-brand {
  display: grid; width: 2.15rem; height: 2.15rem; flex: 0 0 auto;
  place-items: center; border: 1px solid var(--border-strong);
  border-radius: .58rem; background: var(--surface); box-shadow: var(--shadow-sm);
  font-size: .76rem; font-weight: 750;
}
.book-stack {
  display: flex; width: 100%; flex: 1; flex-direction: column; align-items: center;
  gap: .65rem; overflow-y: auto; padding: 1.25rem 0;
  scrollbar-width: none;
}
.book-stack::-webkit-scrollbar { display: none; }
.book-tile {
  position: relative; display: grid; width: 3.25rem; height: 4.15rem;
  flex: 0 0 auto; place-items: center; border: 1px solid var(--border);
  border-radius: .42rem .62rem .62rem .42rem;
  color: #fff; background: #3f3f46; box-shadow: 0 3px 10px rgba(0,0,0,.09);
  transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.book-tile::before {
  position: absolute; top: 0; bottom: 0; left: .3rem; width: 1px;
  background: rgba(255,255,255,.2); content: "";
}
.book-tile > span {
  max-width: 2.25rem; overflow: hidden; text-align: center;
  font-size: .7rem; font-weight: 750; letter-spacing: .06em;
}
.book-tile small {
  position: absolute; right: .28rem; bottom: .22rem; color: rgba(255,255,255,.65);
  font-size: .5rem;
}
.book-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.14); }
.book-tile-active {
  outline: 2px solid var(--foreground); outline-offset: 2px;
}
.book-color-slate { --book-color: #52525b; }
.book-color-sand { --book-color: #78716c; }
.book-color-forest { --book-color: #3f6653; }
.book-color-indigo { --book-color: #4f5685; }
.book-color-rose { --book-color: #85566a; }
.book-color-amber { --book-color: #9a6b2f; }
.book-color-sky { --book-color: #3f7185; }
.book-color-violet { --book-color: #6d568e; }
.book-tile { background: var(--book-color, #52525b); }
.book-tile .book-emoji { font-size: 1.25rem; letter-spacing: 0; }
.rail-create button {
  display: grid; width: 2rem; height: 2rem; place-items: center;
  border: 1px dashed var(--border-strong); border-radius: .5rem;
  color: var(--muted); background: transparent; cursor: pointer;
}
.rail-create button:hover { color: var(--foreground); background: var(--surface-subtle); }
.rail-account { position: relative; margin-top: .7rem; }
.rail-account summary {
  display: grid; width: 2.1rem; height: 2.1rem; place-items: center;
  border-radius: 50%; color: var(--foreground); background: var(--surface-subtle);
  cursor: pointer; font-size: .68rem; font-weight: 700; list-style: none;
}
.rail-account summary::-webkit-details-marker { display: none; }
.rail-account-menu {
  position: absolute; z-index: 50; bottom: 0; left: calc(100% + .8rem);
  display: grid; width: 13.5rem; border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: .55rem; background: var(--surface);
  box-shadow: 0 14px 40px rgba(0,0,0,.14);
}
.rail-account-menu strong, .rail-account-menu > span {
  overflow: hidden; padding: 0 .45rem; text-overflow: ellipsis; white-space: nowrap;
}
.rail-account-menu strong { font-size: .76rem; }
.rail-account-menu > span {
  margin: .15rem 0 .55rem; color: var(--muted); font-size: .64rem;
}
.rail-account-menu a, .rail-account-menu button {
  display: block; width: 100%; border: 0; border-radius: var(--radius-sm);
  padding: .5rem; text-align: left; color: var(--muted);
  background: transparent; cursor: pointer; font-size: .72rem;
}
.rail-account-menu a:hover, .rail-account-menu button:hover {
  color: var(--foreground); background: var(--surface-subtle);
}
.rail-account-menu form { margin: 0; }
.document-panel {
  display: flex; height: 100vh; min-height: 0; overflow: visible;
  flex-direction: column; border-right: 1px solid var(--border);
  padding: .7rem .6rem; background: color-mix(in srgb, var(--background) 74%, var(--surface));
}
.document-panel header {
  position: relative; z-index: 20; display: flex; height: 2.5rem;
  flex: 0 0 auto; align-items: center; justify-content: space-between;
  gap: .5rem; padding: 0 .45rem;
}
.document-panel > header > form { display: flex; margin: 0; }
.document-panel > header > form > button {
  display: grid; width: 1.65rem; height: 1.65rem; place-items: center;
  border: 0; border-radius: var(--radius-sm); color: var(--muted);
  background: transparent; cursor: pointer;
}
.document-panel > header > form > button:hover {
  color: var(--foreground); background: var(--surface-subtle);
}
.document-panel .book-title-form {
  min-width: 0; flex: 1; align-items: center; gap: .4rem;
}
.book-title-form input[name="title"] {
  width: 100%; min-width: 0; border: 1px solid transparent;
  border-radius: var(--radius-sm); padding: .3rem .35rem;
  color: var(--foreground); background: transparent; outline: none;
  font-size: .75rem; font-weight: 650; letter-spacing: -.01em;
  text-overflow: ellipsis;
}
.book-title-form input[name="title"]:hover { background: var(--surface-subtle); }
.book-title-form input[name="title"]:focus {
  border-color: var(--border-strong); background: var(--surface);
  text-overflow: clip;
}
.document-panel .book-title-form button {
  width: 1.5rem; height: 1.5rem; flex: 0 0 auto; opacity: 0;
  pointer-events: none; transition: opacity .12s ease;
}
.document-panel .book-title-form button.book-title-save-visible {
  opacity: 1; pointer-events: auto;
}
.document-panel nav {
  display: grid; min-height: 0; gap: .08rem; overflow-y: auto;
  align-content: start; padding-top: .55rem;
}
.document-panel nav a {
  display: flex; min-width: 0; align-items: center; gap: .5rem;
  border-radius: var(--radius-sm); padding: .48rem .55rem;
  color: var(--muted); font-size: .72rem;
}
.document-panel nav a span { flex: 0 0 auto; color: var(--muted-light); }
.document-panel nav a:hover { color: var(--foreground); background: var(--surface-subtle); }
.document-panel nav .document-link-active {
  color: var(--foreground); background: var(--accent-soft); font-weight: 600;
}
.workspace-canvas {
  min-width: 0; min-height: 0; overflow-x: hidden; overflow-y: auto;
  background: var(--surface);
}
.workspace-bar, .topbar {
  position: relative; display: grid; height: 3.25rem;
  grid-template-columns: minmax(0,1fr) minmax(14rem, 24rem) minmax(0,1fr);
  align-items: center; border-bottom: 1px solid var(--border); padding: 0 .85rem;
}
.workspace-bar .breadcrumbs, .topbar .breadcrumbs { grid-column: 1; grid-row: 1; }
.global-search {
  display: grid; height: 2rem; grid-column: 2; grid-row: 1;
  grid-template-columns: auto 1fr auto; align-items: center; gap: .45rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: 0 .6rem;
  color: var(--muted); background: var(--background); font-size: .68rem;
}
.global-search:hover { border-color: var(--border-strong); color: var(--foreground); }
.global-search kbd {
  border: 1px solid var(--border); border-radius: .25rem; padding: .08rem .3rem;
  color: var(--muted-light); background: var(--surface); font: inherit;
}
.search-dialog {
  width: min(calc(100% - 2rem), 38rem); max-height: min(36rem, calc(100vh - 4rem));
  overflow: hidden; border: 1px solid var(--border-strong); border-radius: .8rem;
  padding: 0; color: var(--foreground); background: var(--surface);
  box-shadow: 0 24px 80px rgba(0,0,0,.28);
}
.search-dialog::backdrop {
  background: rgba(0,0,0,.46); backdrop-filter: blur(2px);
}
.search-dialog-shell { display: grid; max-height: inherit; grid-template-rows: auto minmax(5rem,1fr) auto; }
.search-dialog header {
  display: grid; height: 3.5rem; grid-template-columns: auto 1fr auto;
  align-items: center; gap: .65rem; border-bottom: 1px solid var(--border);
  padding: 0 .85rem; color: var(--muted);
}
.search-dialog input {
  width: 100%; border: 0; padding: 0; color: var(--foreground);
  background: transparent; outline: none; font-size: .9rem;
}
.search-dialog kbd {
  border: 1px solid var(--border); border-radius: .3rem; padding: .15rem .4rem;
  color: var(--muted-light); background: var(--background); font: inherit; font-size: .62rem;
}
.search-dialog-results { overflow-y: auto; padding: .4rem; }
.search-dialog-results > p { padding: 1.5rem; color: var(--muted); text-align: center; font-size: .75rem; }
.search-dialog-results a {
  display: grid; border-radius: .5rem; padding: .62rem .7rem;
}
.search-dialog-results a span { color: var(--muted-light); font-size: .6rem; }
.search-dialog-results a strong { margin-top: .12rem; font-size: .78rem; }
.search-dialog-results a small {
  overflow: hidden; margin-top: .2rem; color: var(--muted); font-size: .68rem;
  text-overflow: ellipsis; white-space: nowrap;
}
.search-dialog-results .search-dialog-result-active { background: var(--accent-soft); }
.search-dialog footer {
  display: flex; justify-content: flex-end; gap: .9rem; border-top: 1px solid var(--border);
  padding: .45rem .75rem; color: var(--muted-light); font-size: .58rem;
}
.workspace-bar .topbar-actions, .topbar .topbar-actions,
.editor-workspace-bar .editor-actions {
  grid-column: 3; grid-row: 1; justify-self: end;
}
.editor-workspace-bar .global-search {
  width: min(100%, 18rem); justify-self: center;
}
.compact-button { min-height: 2rem; padding: .35rem .7rem; }
.app-shell { grid-template-columns: 14.5rem minmax(0, 1fr); }
.sidebar { background: color-mix(in srgb, var(--background) 72%, var(--surface)); }
.sidebar-header { height: 3.25rem; padding: 0 .75rem; }
.sidebar-header .wordmark { font-size: .8rem; }
.workspace-switcher {
  margin: .25rem .6rem .7rem; border: 0; padding: .5rem;
  background: transparent; box-shadow: none;
}
.workspace-switcher:hover { background: var(--surface-subtle); }
.sidebar-nav { padding: 0 .6rem; }
.nav-label { padding-top: .65rem; }
.nav-group { margin-bottom: .35rem; }
.nav-group-heading { padding: .35rem .5rem; }
.page-link { min-height: 2rem; padding: .35rem .5rem; }
.sidebar-footer { padding: .65rem .75rem; }
.topbar .button { min-height: 2rem; padding: .35rem .7rem; }
.document { padding-top: 5rem; }
.quiet-action {
  display: inline-flex; min-height: 2rem; align-items: center; gap: .4rem;
  border-radius: var(--radius-sm); padding: 0 .55rem;
  color: var(--muted); font-size: .75rem; font-weight: 550;
}
.quiet-action:hover { color: var(--foreground); background: var(--surface-subtle); }
.save-state { margin-left: auto; margin-right: .4rem; color: var(--muted-light); font-size: .68rem; }
.save-state:empty { display: none; }
.visibility-menu, .page-menu { position: relative; }
.visibility-menu summary, .page-menu summary {
  list-style: none; cursor: pointer;
}
.visibility-menu summary::-webkit-details-marker,
.page-menu summary::-webkit-details-marker { display: none; }
.visibility-menu summary {
  display: flex; min-height: 2rem; align-items: center; gap: .4rem;
  border-radius: var(--radius-sm); padding: 0 .55rem; color: var(--muted);
  font-size: .7rem; text-transform: capitalize;
}
.visibility-menu summary:hover { background: var(--surface-subtle); }
.visibility-popover, .page-menu-popover {
  position: absolute; z-index: 20; top: calc(100% + .45rem); right: 0;
  width: 13rem; border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: .45rem; background: var(--surface);
  box-shadow: 0 12px 30px rgba(0,0,0,.12);
}
.visibility-popover label {
  display: flex; align-items: center; justify-content: space-between;
  gap: .75rem; padding: .4rem; color: var(--muted); font-size: .7rem;
}
.visibility-popover select {
  width: 6rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: .3rem; background: var(--surface); font-size: .7rem;
}
.page-menu-popover { display: grid; width: 11rem; }
.page-menu-popover a, .page-menu-popover button {
  display: flex; width: 100%; min-height: 2rem; align-items: center; gap: .5rem;
  border: 0; border-radius: var(--radius-sm); padding: .5rem .6rem;
  text-align: left; color: var(--muted); background: transparent;
  cursor: pointer; font-size: .72rem; font-weight: 550;
}
.page-menu-popover a:hover, .page-menu-popover button:hover {
  color: var(--foreground); background: var(--surface-subtle);
}
.page-menu-popover .danger-action { color: #dc2626; }
.page-menu-popover .danger-action:hover { color: #b91c1c; background: #fef2f2; }
.page-menu-popover form { margin: 0; }
.book-menu .page-menu-popover {
  right: -.25rem; width: 13rem;
}
.book-appearance-form {
  display: grid !important; gap: .75rem; margin-bottom: .4rem !important;
  border-bottom: 1px solid var(--border); padding: .45rem .45rem .8rem;
}
.book-appearance-form > strong {
  overflow: visible; white-space: nowrap; font-size: .72rem;
}
.book-color-options {
  display: grid; grid-template-columns: repeat(4, 1.35rem); gap: .55rem;
}
.book-color-options label {
  display: grid; width: 1.35rem; height: 1.35rem; place-items: center;
  border-radius: 50%; background: var(--book-color); cursor: pointer;
}
.book-color-options input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.book-color-options span {
  width: .45rem; height: .45rem; border-radius: 50%; background: transparent;
}
.book-color-options input:checked + span {
  background: white; box-shadow: 0 0 0 2px rgba(255,255,255,.35);
}
.book-color-options label:has(input:focus-visible) {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.book-icon-field {
  display: grid; grid-template-columns: auto 1fr; align-items: center;
  gap: .55rem; color: var(--muted); font-size: .68rem;
}
.book-icon-field input {
  min-width: 0; height: 2rem; border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 0 .55rem;
  color: var(--foreground); background: var(--surface);
}
.book-appearance-form .button { width: 100%; }
.visual-editor { background: var(--background); }
.visual-editor-canvas {
  height: calc(100vh - 3.25rem); overflow-y: auto; padding: 3.5rem 1.5rem 9rem;
}
.editor-page {
  width: min(100%, 50rem); min-height: 44rem; margin: 0 auto;
  border: 1px solid var(--border); border-radius: .85rem;
  padding: 3.75rem 4.5rem 5rem; background: var(--surface);
  box-shadow: 0 1px 2px rgba(0,0,0,.03), 0 14px 50px rgba(0,0,0,.035);
}
.visual-editor .title-input {
  width: 100%; height: auto; border: 0; padding: 0;
  font-size: 2.6rem; line-height: 1.1; letter-spacing: -.055em;
}
.floating-format-toolbar {
  position: sticky; z-index: 10; top: -.5rem; width: max-content;
  max-width: 100%; min-height: 2.45rem; margin: 1.75rem 0 1.5rem;
  border: 1px solid var(--border); border-radius: .55rem; padding: .25rem;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  box-shadow: 0 5px 18px rgba(0,0,0,.07); backdrop-filter: blur(12px);
}
.floating-format-toolbar select {
  height: 1.8rem; border: 0; padding: 0 .45rem; color: var(--muted);
  background: transparent; outline: none; font-size: .72rem;
}
.visual-content {
  min-height: 25rem; outline: none; font-size: 1rem; line-height: 1.75;
}
.visual-content:empty::before {
  color: var(--muted-light); content: "Start writing…";
}
.visual-content h2 { margin-top: 2.25rem; font-size: 1.55rem; }
.visual-content h3 { margin-top: 1.75rem; font-size: 1.2rem; }
.visual-content blockquote {
  margin: 1.5rem 0; border-left: 2px solid var(--border-strong);
  padding-left: 1rem; color: var(--muted);
}
.visual-content img {
  display: block; max-width: 100%; height: auto; border-radius: var(--radius-lg);
}
.visual-content figure { margin: 2rem 0; }
.visual-content figcaption {
  margin-top: .5rem; color: var(--muted-light); text-align: center; font-size: .7rem;
}
.editor-hint { margin: 3rem 0 0; color: var(--muted-light); font-size: .68rem; }
.editor-hint kbd {
  border: 1px solid var(--border); border-radius: .25rem; padding: .05rem .3rem;
  background: var(--surface-subtle); font: inherit;
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
  .atrium-shell { grid-template-columns: 1fr; }
  .document-panel { display: none; }
  .book-rail {
    position: fixed; z-index: 50; right: 0; bottom: 0; left: 0;
    width: 100%; height: 3.75rem; flex-direction: row; border-top: 1px solid var(--border);
    border-right: 0; padding: .45rem .7rem;
  }
  .book-stack { flex-direction: row; gap: .55rem; padding: 0 .7rem; }
  .book-tile { width: 2.15rem; height: 2.65rem; }
  .book-tile small, .book-tile::before { display: none; }
  .rail-create { order: 2; }
  .rail-account { order: 3; margin: 0 0 0 .55rem; }
  .rail-account-menu { right: 0; bottom: calc(100% + .7rem); left: auto; }
  .workspace-bar, .topbar {
    grid-template-columns: minmax(0, 1fr) auto; padding: 0 .75rem;
  }
  .global-search { width: 2rem; grid-column: 2; padding: 0; place-items: center; }
  .global-search span:nth-child(2), .global-search kbd { display: none; }
  .workspace-bar .topbar-actions, .topbar .topbar-actions,
  .editor-workspace-bar .editor-actions { grid-column: 2; }
  .editor-workspace-bar .global-search { display: none; }
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .topbar { padding: 0 1rem; }
  .visibility-badge { display: none; }
  .document { width: min(100% - 2rem, 47rem); padding-top: 3.5rem; }
  .document h1 { font-size: 2.2rem; }
  .editor-grid { grid-template-columns: 1fr; }
  .preview-pane { display: none; }
  .visual-editor-canvas { padding: 0; }
  .editor-page {
    min-height: calc(100vh - 3.25rem); border: 0; border-radius: 0;
    padding: 2.5rem 1.25rem 6rem; box-shadow: none;
  }
  .visual-editor .title-input { font-size: 2rem; }
  .visibility-menu { display: none; }
}
`;
