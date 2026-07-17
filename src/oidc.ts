import type { AtriumConfig } from "./config.ts";
import { createSessionToken } from "./auth.ts";

type Discovery = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  code_challenge_methods_supported?: string[];
};

export async function createOidcAuthorization(
  config: AtriumConfig,
  saveState: (verifier: string) => Promise<string>,
): Promise<string> {
  const oidc = requiredOidc(config);
  const discovery = await discover(oidc.issuer);
  const verifier = createSessionToken();
  const challenge = await sha256Base64Url(verifier);
  const state = await saveState(verifier);
  const url = new URL(discovery.authorization_endpoint);
  url.searchParams.set("client_id", oidc.clientId);
  url.searchParams.set("redirect_uri", `${config.baseUrl}/auth/oidc/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeOidcCode(
  config: AtriumConfig,
  code: string,
  verifier: string,
): Promise<{
  issuer: string;
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
}> {
  const oidc = requiredOidc(config);
  const discovery = await discover(oidc.issuer);
  const credentials = btoa(`${oidc.clientId}:${oidc.clientSecret}`);
  const tokenResponse = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: `${config.baseUrl}/auth/oidc/callback`,
    }),
  });
  if (!tokenResponse.ok) throw new Error("OIDC token exchange failed.");
  const tokens = await tokenResponse.json() as { access_token?: string };
  if (!tokens.access_token) {
    throw new Error("OIDC provider returned no access token.");
  }

  const userInfoResponse = await fetch(discovery.userinfo_endpoint, {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userInfoResponse.ok) {
    throw new Error("OIDC user information request failed.");
  }
  const claims = await userInfoResponse.json() as Record<string, unknown>;
  const subject = String(claims.sub ?? "");
  const email = String(claims.email ?? "").toLowerCase();
  if (!subject || !email.includes("@")) {
    throw new Error("OIDC account must provide subject and email claims.");
  }
  return {
    issuer: discovery.issuer,
    subject,
    email,
    emailVerified: claims.email_verified === true,
    name: String(claims.name ?? claims.preferred_username ?? email),
  };
}

async function discover(issuer: string): Promise<Discovery> {
  const issuerUrl = new URL(issuer);
  if (
    issuerUrl.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(issuerUrl.hostname)
  ) {
    throw new Error("OIDC issuer must use HTTPS.");
  }
  const response = await fetch(
    `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`,
  );
  if (!response.ok) throw new Error("OIDC discovery failed.");
  const metadata = await response.json() as Partial<Discovery>;
  if (metadata.issuer !== issuer.replace(/\/$/, "")) {
    throw new Error("OIDC discovery issuer does not match configuration.");
  }
  for (
    const endpoint of [
      metadata.authorization_endpoint,
      metadata.token_endpoint,
      metadata.userinfo_endpoint,
    ]
  ) {
    if (!endpoint || !isSecureEndpoint(endpoint)) {
      throw new Error("OIDC discovery returned an invalid endpoint.");
    }
  }
  if (
    metadata.code_challenge_methods_supported &&
    !metadata.code_challenge_methods_supported.includes("S256")
  ) {
    throw new Error("OIDC provider does not support PKCE S256.");
  }
  return metadata as Discovery;
}

function requiredOidc(config: AtriumConfig) {
  if (!config.oidc) throw new Error("OIDC is not configured.");
  return config.oidc;
}

function isSecureEndpoint(value: string): boolean {
  const url = new URL(value);
  return url.protocol === "https:" ||
    ["localhost", "127.0.0.1"].includes(url.hostname);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
