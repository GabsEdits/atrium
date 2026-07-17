export type ContentVisibility = "public" | "unlisted" | "private";

export type Role = "owner" | "editor" | "reader";

export type AtriumOptions = {
  hostname?: string;
  port?: number;
  dataDirectory?: string;
  baseUrl?: string;
  secureCookies?: boolean;
};
