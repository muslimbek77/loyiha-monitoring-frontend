const API_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ?? "https://loyiha.kuprikqurilish.uz/api/v1";

const SITE_ORIGIN = new URL(API_BASE_URL).origin;

export const buildAssetUrl = (value?: string | null) => {
  if (!value) return undefined;

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/^http:\/\//i, "https://");
  }

  return new URL(value, SITE_ORIGIN).toString();
};
