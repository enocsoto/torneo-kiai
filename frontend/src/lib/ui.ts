/** Reusable classes: press feedback, visible focus, no `transition: all`. */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

export const pressScale =
  "transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100";

/** Hover only for fine pointers (avoids “sticky hover” on touch). */
export const hoverLift =
  "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lg";

/**
 * Chip button: subtle border, translucent surface, hover + press feedback.
 * Add `px-* py-*`, `text-*`, and `font-*` per use case.
 * Pair with `focusRing`.
 */
export const chipBtn =
  "rounded-lg border border-[var(--border-subtle)] bg-[var(--chip-surface)] text-[var(--foreground)] " +
  "transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none " +
  "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--border-muted)] " +
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] " +
  "active:scale-[0.96] motion-reduce:active:scale-100 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none " +
  "disabled:[@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--border-subtle)] " +
  "disabled:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface)]";

/**
 * Back navigation link: ghost look, hover chip background, subtle press.
 * Add `text-*`, `font-*`, and padding per use case.
 */
export const backLink =
  "inline-flex items-center gap-1 rounded-lg text-[var(--accent-text)] " +
  "transition-[transform,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none " +
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface)] " +
  "active:scale-[0.96] motion-reduce:active:scale-100";
