"use client";

import Image from "next/image";
import { getWarriorPortraitUrl, isRemoteImage } from "@/lib/warrior-image";

type Props = {
  slug: string;
  imageUrl?: string | null;
  nombre: string;
  className?: string;
  /** No hover lift (e.g. nested inside a button that already animates). */
  embedInButton?: boolean;
  /**
   * Image should be visible on load (LCP). Skips Next warning and loads with priority.
   * Use for anchor portraits on the first paint (e.g. battle).
   */
  priority?: boolean;
  /**
   * How the image fits the container.
   * - "cover" (default): crop to fill; good for battle / cinematic.
   * - "contain": show the full character; good for roster selection.
   */
  objectFit?: "cover" | "contain";
};

export function WarriorPortrait({
  slug,
  imageUrl,
  nombre,
  className,
  embedInButton = false,
  priority = false,
  objectFit = "cover",
}: Props) {
  const src = getWarriorPortraitUrl(slug, imageUrl);
  const remote = isRemoteImage(src);
  const frame = className ?? "h-56 w-44";
  const hoverFx = embedInButton
    ? ""
    : "transition-[transform,box-shadow] duration-200 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-orange-500/15 [@media(hover:hover)_and_(pointer:fine)]:hover:ring-orange-400/20";

  const imgClass =
    objectFit === "contain"
      ? "object-contain object-bottom"
      : "object-cover object-top";

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[var(--portrait-bg)] ring-1 ring-[var(--border-subtle)] shadow-lg ${hoverFx} ${frame}`}
    >
      {remote ? (
        <Image
          src={src}
          alt=""
          fill
          className={imgClass}
          sizes="(max-width: 640px) 45vw, 200px"
          priority={priority}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={`h-full w-full ${imgClass}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      )}
      <span className="sr-only">{nombre}</span>
    </div>
  );
}
