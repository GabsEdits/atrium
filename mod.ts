import { startAtrium } from "./src/server.ts";
import { backupAtrium } from "./src/backup.ts";
import { loadConfig } from "./src/config.ts";

export { createApp } from "./src/server.ts";
export type { AtriumOptions, ContentVisibility, Role } from "./src/types.ts";

if (import.meta.main) {
  if (Deno.args[0] === "backup") {
    const config = loadConfig();
    const destination = Deno.args[1] ?? "./backups";
    const path = await backupAtrium(config.dataDirectory, destination);
    console.log(`Atrium backup created at ${path}`);
  } else {
    await startAtrium();
  }
}
