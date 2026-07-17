import type { AtriumOptions } from "./types.ts";

export type AtriumConfig = {
  hostname: string;
  port: number;
  dataDirectory: string;
  baseUrl: string;
  secureCookies: boolean;
  mail: {
    resendApiKey?: string;
    from: string;
  };
  oidc?: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    autoProvision: boolean;
  };
};

export function loadConfig(options: AtriumOptions = {}): AtriumConfig {
  const hostname = options.hostname ?? Deno.env.get("ATRIUM_HOST") ??
    "127.0.0.1";
  const port = options.port ?? numberEnv("ATRIUM_PORT") ?? 3000;
  const dataDirectory = options.dataDirectory ??
    Deno.env.get("ATRIUM_DATA_DIR") ?? ".atrium";
  const baseUrl = (
    options.baseUrl ?? Deno.env.get("ATRIUM_BASE_URL") ??
      `http://${hostname}:${port}`
  ).replace(/\/$/, "");
  const secureCookies = options.secureCookies ??
    booleanEnv("ATRIUM_SECURE_COOKIES") ?? baseUrl.startsWith("https://");

  const oidcIssuer = Deno.env.get("ATRIUM_OIDC_ISSUER");
  const oidcClientId = Deno.env.get("ATRIUM_OIDC_CLIENT_ID");
  const oidcClientSecret = Deno.env.get("ATRIUM_OIDC_CLIENT_SECRET");
  if (
    [oidcIssuer, oidcClientId, oidcClientSecret].some(Boolean) &&
    !(oidcIssuer && oidcClientId && oidcClientSecret)
  ) {
    throw new Error(
      "ATRIUM_OIDC_ISSUER, ATRIUM_OIDC_CLIENT_ID, and ATRIUM_OIDC_CLIENT_SECRET must be set together.",
    );
  }

  return {
    hostname,
    port,
    dataDirectory,
    baseUrl,
    secureCookies,
    mail: {
      resendApiKey: Deno.env.get("ATRIUM_RESEND_API_KEY") || undefined,
      from: Deno.env.get("ATRIUM_MAIL_FROM") ?? "Atrium <noreply@localhost>",
    },
    oidc: oidcIssuer && oidcClientId && oidcClientSecret
      ? {
        issuer: oidcIssuer.replace(/\/$/, ""),
        clientId: oidcClientId,
        clientSecret: oidcClientSecret,
        autoProvision: booleanEnv("ATRIUM_OIDC_AUTO_PROVISION") ?? false,
      }
      : undefined,
  };
}

function numberEnv(name: string): number | undefined {
  const value = Deno.env.get(name);
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(`${name} must be a valid port number.`);
  }
  return parsed;
}

function booleanEnv(name: string): boolean | undefined {
  const value = Deno.env.get(name)?.toLowerCase();
  if (value === undefined) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error(`${name} must be true or false.`);
}
