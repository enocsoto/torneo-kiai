"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nContext";
import { useTheme } from "@/theme/ThemeContext";
import { focusRing } from "@/lib/ui";

export function SiteToolbar() {
  const pathname = usePathname();
  const isSupport = pathname?.startsWith("/support") ?? false;
  const { locale, setLocale, t } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <div
      className="pointer-events-none fixed z-[150] flex flex-nowrap items-center justify-end gap-1.5 sm:gap-2"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top, 0px))",
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
      role="navigation"
      aria-label={t("toolbar.lang")}
    >
      <div className="pointer-events-auto flex rounded-xl border border-[var(--border-muted)] bg-[var(--surface-glass)] p-0.5 shadow-lg backdrop-blur-md transition-[box-shadow,background-color] duration-200 ease-out sm:p-1">
        <button
          type="button"
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-[transform,background-color,color] duration-150 ease-out motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs ${locale === "es" ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm" : "text-[var(--muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--surface-raised)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)]"} ${focusRing}`}
          onClick={() => setLocale("es")}
          aria-pressed={locale === "es"}
        >
          ES
        </button>
        <button
          type="button"
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-[transform,background-color,color] duration-150 ease-out motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs ${locale === "en" ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm" : "text-[var(--muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--surface-raised)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)]"} ${focusRing}`}
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
        >
          EN
        </button>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`pointer-events-auto shrink-0 rounded-lg border border-[var(--border-muted)] bg-[var(--surface-glass)] px-2.5 py-1.5 text-sm font-medium text-[var(--foreground-secondary)] shadow-lg backdrop-blur-md transition-[transform,background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--surface-raised)] active:scale-[0.97] motion-reduce:active:scale-100 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${focusRing}`}
        aria-label={
          theme === "dark" ? t("toolbar.themeLight") : t("toolbar.themeDark")
        }
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {!isSupport ? (
        <Link
          href="/support"
          aria-label={t("coffee.navAriaLabel")}
          className={`pointer-events-auto shrink-0 rounded-lg border border-[var(--border-muted)] bg-[var(--surface-glass)] px-2 py-1.5 text-sm shadow-lg backdrop-blur-md transition-[transform,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--surface-raised)] active:scale-[0.97] motion-reduce:active:scale-100 sm:rounded-xl sm:px-2.5 sm:py-2 ${focusRing}`}
        >
          ☕
        </Link>
      ) : null}
    </div>
  );
}
