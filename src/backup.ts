import { AtriumStore } from "./store.ts";

export async function backupAtrium(
  dataDirectory: string,
  destinationDirectory: string,
): Promise<string> {
  const databasePath = `${dataDirectory}/atrium.db`;
  const store = new AtriumStore(databasePath);
  store.checkpoint();
  store.close();

  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const backupDirectory = `${
    destinationDirectory.replace(/\/$/, "")
  }/atrium-${timestamp}`;
  await Deno.mkdir(backupDirectory, { recursive: true });
  await Deno.copyFile(databasePath, `${backupDirectory}/atrium.db`);

  try {
    await copyDirectory(
      `${dataDirectory}/assets`,
      `${backupDirectory}/assets`,
    );
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }

  await Deno.writeTextFile(
    `${backupDirectory}/backup.json`,
    JSON.stringify(
      {
        application: "Atrium",
        createdAt: new Date().toISOString(),
        formatVersion: 1,
      },
      null,
      2,
    ) + "\n",
  );
  return backupDirectory;
}

async function copyDirectory(
  source: string,
  destination: string,
): Promise<void> {
  await Deno.mkdir(destination, { recursive: true });
  for await (const entry of Deno.readDir(source)) {
    const sourcePath = `${source}/${entry.name}`;
    const destinationPath = `${destination}/${entry.name}`;
    if (entry.isDirectory) {
      await copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile) {
      await Deno.copyFile(sourcePath, destinationPath);
    }
  }
}
