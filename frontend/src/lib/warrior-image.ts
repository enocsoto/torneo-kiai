/** Portrait: remote URL (e.g. Wikimedia) or local SVG under /public/characters. */
export function getWarriorPortraitUrl(
  slug: string,
  imageUrl?: string | null,
): string {
  const u = imageUrl?.trim();
  if (u) return u;
  return `/characters/${slug}.svg`;
}

export function isRemoteImage(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
