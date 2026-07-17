import { page } from "./shared.ts";

export function renderWelcome(): string {
  return page(
    "Atrium",
    `<main class="welcome">
      <div class="brand-mark" aria-hidden="true">A</div>
      <div>
        <p class="eyebrow">Powered by Steno</p>
        <h1>Your knowledge,<br>in one place.</h1>
        <p class="lead">
          Public documentation and private team knowledge in a calm,
          beautifully simple home.
        </p>
      </div>
      <a class="button button-primary" href="/setup">Set up Atrium</a>
      <p class="hint">One command. No database setup. Yours to keep.</p>
    </main>`,
    "landing-body",
  );
}
