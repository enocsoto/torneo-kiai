/**
 * Contact links: prefer GET /public/contact-links from the API (CONTACT_* on the server).
 * NEXT_PUBLIC_* is a build-time fallback when the API is down or empty.
 */

import { getApiBase } from "./api-base";

const DEFAULT_SUPPORT_EMAIL = "esotoarenilla@gmail.com";

export type ContactLinks = {
  whatsapp: string | null;
  telegram: string | null;
};

/** Public contact email: `NEXT_PUBLIC_CONTACT_EMAIL` or default. */
export function getSupportEmail(): string {
  const raw = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";
  if (raw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return raw;
  }
  return DEFAULT_SUPPORT_EMAIL;
}

export function getWhatsAppHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const text = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_TEXT?.trim();
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function getTelegramHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONTACT_TELEGRAM?.trim() ?? "";
  if (!raw) return null;
  const cleaned = raw.replace(/^@/, "");
  const digits = cleaned.replace(/\D/g, "");
  const looksLikePhone =
    digits.length >= 8 && /^[\d\s+()\-]+$/.test(cleaned);
  return looksLikePhone
    ? `https://t.me/+${digits}`
    : `https://t.me/${encodeURIComponent(cleaned)}`;
}

export async function fetchContactLinksFromApi(): Promise<ContactLinks> {
  const base = getApiBase().replace(/\/$/, "");
  const res = await fetch(`${base}/public/contact-links`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as ContactLinks;
  return {
    whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : null,
    telegram: typeof data.telegram === "string" ? data.telegram : null,
  };
}

/** Prefer the API; fill any empty channel from NEXT_PUBLIC_*. */
export async function resolveContactLinks(): Promise<ContactLinks> {
  try {
    const fromApi = await fetchContactLinksFromApi();
    return {
      whatsapp: fromApi.whatsapp ?? getWhatsAppHref(),
      telegram: fromApi.telegram ?? getTelegramHref(),
    };
  } catch {
    return {
      whatsapp: getWhatsAppHref(),
      telegram: getTelegramHref(),
    };
  }
}
