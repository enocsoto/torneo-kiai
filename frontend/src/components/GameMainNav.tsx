"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useTheme } from "@/theme/ThemeContext";
import { focusRing } from "@/lib/ui";
import { getSession, clearSession } from "@/lib/identity";

const BASE_NAV = [
  { href: "/", key: "nav.selection", icon: "home" as const },
  { href: "/play/online", key: "nav.online", icon: "online" as const },
  { href: "/skills", key: "nav.skills", icon: "skills" as const },
] satisfies {
  href: string;
  key: string;
  icon: "home" | "online" | "skills";
}[];

type NavIcon = "home" | "online" | "skills" | "activity" | "about";

function NavGlyph({
  name,
  className,
}: {
  name: NavIcon;
  className?: string;
}) {
  const c = className ?? "size-[1.1rem] shrink-0";
  switch (name) {
    case "online":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5a2.5 2.5 0 0 0 5 0M7 5.5A6 6 0 0 0 4 12c0 2.1 1.1 3.9 2.6 4.6M5 3.5A9.5 9.5 0 0 0 1 12a9.5 9.5 0 0 0 4.5 7.2M9 2.2a9 9 0 0 1 3-.3c4.1 0 7.2 2.2 7.2 4.3 0 1.1-.7 2.1-1.6 2.5" />
        </svg>
      );
    case "home":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3l7.5 7.5M6 9.75V19.5A1.5 1.5 0 007.5 21H9m6 0h1.5A1.5 1.5 0 0018 19.5V9.75M9 21v-4.5A1.5 1.5 0 0110.5 15h3A1.5 1.5 0 0115 16.5V21" />
        </svg>
      );
    case "skills":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.2 4.3 4.8.5-3.4 3.3.8 4.6L12 12.6 7.6 14.7l.8-4.6L5 6.8l4.8-.5L12 2zM5 20h14" />
        </svg>
      );
    case "activity":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5 7.5 9l3 3L15 7.5l4.5 4.5M3 19h18" />
        </svg>
      );
    case "about":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 16v-5M12 8h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function AliasChip({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [alias, setAlias] = useState<string | null>(null);

  useEffect(() => {
    setAlias(getSession()?.alias ?? null);
  }, []);

  if (!alias) return null;

  const handleLogout = () => {
    clearSession();
    window.location.reload();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2 mt-1">
        <span className="game-nav-mobile-icon text-[var(--accent-text)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden>
            <circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-[var(--foreground)] truncate flex-1">{alias}</span>
        <button
          type="button"
          onClick={handleLogout}
          className={`shrink-0 text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--status-danger-bright)] transition-colors ${focusRing} rounded px-1`}
        >
          {t("identity.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] pl-2.5 pr-1 py-1">
      <span className="text-[11px] font-semibold text-[var(--accent-text)] max-w-[7rem] truncate">{alias}</span>
      <button
        type="button"
        onClick={handleLogout}
        title={t("identity.logout")}
        aria-label={t("identity.logout")}
        className={`flex size-6 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--status-danger-bright)] transition-colors ${focusRing}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameMainNav() {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasBattles, setHasBattles] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      setHasBattles(localStorage.getItem("torneo-kiai-has-battles") === "1");
    }
  }, [pathname]);

  const NAV = hasBattles
    ? [
        ...BASE_NAV,
        { href: "/activity", key: "nav.activity", icon: "activity" as const },
      ]
    : BASE_NAV;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const topPad = "pt-[max(0.25rem,env(safe-area-inset-top,0px))]";
  const barH = "min-h-14";
  const spacerH =
    "min-h-[calc(3.5rem+max(0.25rem,env(safe-area-inset-top,0px)))]";

  return (
    <>
      <header
        className={`game-nav-shell fixed top-0 right-0 left-0 z-[160] ${topPad} ${barH}`}
        role="banner"
      >
        <div
          className="game-nav-shimmer pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-px opacity-90"
          aria-hidden
        />
        <div
          className="relative z-[1] mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0 px-3 py-1.5 sm:px-4 md:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] md:gap-x-3 md:py-2"
        >
          <Link
            href="/"
            className={`group flex min-w-0 items-center gap-1.5 sm:gap-2.5 md:pr-1 ${focusRing} rounded-xl py-0.5 pr-0.5`}
          >
            <span className="game-nav-mark shrink-0" aria-hidden>
              <span className="game-nav-mark-inner" />
            </span>
            <span className="min-w-0 text-left">
              <span className="game-nav-brand-title truncate text-sm sm:text-base">
                {t("app.title")}
              </span>
              <span className="game-nav-brand-sub max-sm:hidden sm:block">
                {t("nav.brandTag")}
              </span>
            </span>
          </Link>

          <nav
            className="game-nav-center hidden min-w-0 justify-self-stretch md:flex"
            aria-label={t("nav.ariaMain")}
          >
            {NAV.map(({ href, key, icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "game-nav-link shrink-0",
                    active ? "game-nav-link--active" : "",
                    focusRing,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <NavGlyph
                    name={icon}
                    className="game-nav-link-icon size-[1.05rem] shrink-0 xl:size-[1.1rem]"
                  />
                  {t(key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end justify-self-end gap-1.5 sm:gap-2">
            {/* Alias chip — desktop */}
            <div className="hidden md:flex">
              <AliasChip />
            </div>

            <div className="game-nav-controls hidden shadow-md backdrop-blur-sm md:flex">
              <button
                type="button"
                className={[
                  "game-nav-ctrl",
                  locale === "es" ? "game-nav-ctrl--on" : "",
                  focusRing,
                ].join(" ")}
                onClick={() => setLocale("es")}
                aria-pressed={locale === "es"}
                aria-label="Español"
              >
                ES
              </button>
              <button
                type="button"
                className={[
                  "game-nav-ctrl",
                  locale === "en" ? "game-nav-ctrl--on" : "",
                  focusRing,
                ].join(" ")}
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                aria-label="English"
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={toggle}
              className={`game-nav-ctrl-icon hidden active:scale-[0.98] motion-reduce:active:scale-100 md:inline-flex ${focusRing}`}
              aria-label={
                theme === "dark" ? t("toolbar.themeLight") : t("toolbar.themeDark")
              }
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            <Link
              href="/about"
              className={[
                "game-nav-ctrl-icon hidden items-center gap-1 active:scale-[0.98] motion-reduce:active:scale-100 md:inline-flex",
                isActivePath(pathname, "/about") ? "ring-1 ring-[var(--accent)]/35" : "",
                focusRing,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={t("about.navAria")}
            >
              <NavGlyph
                name="about"
                className="size-[0.9rem] shrink-0 sm:size-[0.95rem] text-[var(--accent-text)]"
              />
              <span className="text-[10px] font-semibold sm:text-[11px]">{t("nav.about")}</span>
            </Link>
            {/* Contact → /support (no modal) */}
            <Link
              href="/support"
              className={`game-nav-ctrl-icon hidden items-center gap-1 active:scale-[0.98] motion-reduce:active:scale-100 md:inline-flex ${focusRing}`}
              aria-label={t("coffee.navAriaLabel")}
            >
              <span className="text-sm leading-none" aria-hidden>☕</span>
              <span className="text-[10px] font-semibold sm:text-[11px]">{t("coffee.navLabel")}</span>
            </Link>

            <button
              type="button"
              className={`game-nav-burger inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md active:scale-[0.98] motion-reduce:active:scale-100 md:hidden ${focusRing}`}
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              aria-label={mobileOpen ? t("nav.menuClose") : t("nav.menuOpen")}
            >
              {mobileOpen ? (
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h10"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={spacerH} aria-hidden />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[170] md:hidden"
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.ariaMain")}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 cursor-default border-0 bg-[var(--scrim)] backdrop-blur-[2px]"
            aria-label={t("nav.menuClose")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="game-nav-overlay pointer-events-auto absolute right-0 left-0 z-10 top-[calc(3.5rem+max(0.25rem,env(safe-area-inset-top,0px)))] flex max-h-[min(32rem,calc(100dvh-4.5rem))] min-h-0 w-full flex-col overflow-hidden rounded-b-3xl border-b border-orange-500/25 shadow-2xl">
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
              <div className="game-nav-controls game-nav-controls--compact flex">
                <button
                  type="button"
                  className={[
                    "game-nav-ctrl",
                    locale === "es" ? "game-nav-ctrl--on" : "",
                    focusRing,
                  ].join(" ")}
                  onClick={() => setLocale("es")}
                  aria-pressed={locale === "es"}
                  aria-label="Español"
                >
                  ES
                </button>
                <button
                  type="button"
                  className={[
                    "game-nav-ctrl",
                    locale === "en" ? "game-nav-ctrl--on" : "",
                    focusRing,
                  ].join(" ")}
                  onClick={() => setLocale("en")}
                  aria-pressed={locale === "en"}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={toggle}
                className={`game-nav-ctrl-icon game-nav-ctrl-icon--compact inline-flex ${focusRing} active:scale-[0.98] motion-reduce:active:scale-100`}
                aria-label={
                  theme === "dark" ? t("toolbar.themeLight") : t("toolbar.themeDark")
                }
              >
                {theme === "dark" ? "☀" : "☾"}
              </button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3"
              aria-label={t("nav.ariaMain")}
            >
              {NAV.map(({ href, key, icon }, i) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "game-nav-mobile-item",
                      active ? "game-nav-mobile-item--active" : "",
                      focusRing,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ animationDelay: `${i * 40}ms` }}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className="game-nav-mobile-icon"
                    >
                      <NavGlyph name={icon} className="size-5" />
                    </span>
                    {t(key)}
                  </Link>
                );
              })}

              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className={[
                  "game-nav-mobile-item mt-1 border-t border-[var(--border-subtle)] pt-2",
                  isActivePath(pathname, "/about")
                    ? "game-nav-mobile-item--active"
                    : "",
                  focusRing,
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${NAV.length * 40}ms` }}
                aria-label={t("about.navAria")}
                aria-current={isActivePath(pathname, "/about") ? "page" : undefined}
              >
                <span className="game-nav-mobile-icon text-[var(--accent-text)]">
                  <NavGlyph name="about" className="size-5" />
                </span>
                {t("nav.about")}
              </Link>

              {/* Contact → /support (no modal) */}
              <Link
                href="/support"
                onClick={() => setMobileOpen(false)}
                className={[
                  "game-nav-mobile-item",
                  focusRing,
                ].join(" ")}
                style={{ animationDelay: `${(NAV.length + 1) * 40}ms` }}
                aria-label={t("coffee.navAriaLabel")}
              >
                <span className="game-nav-mobile-icon text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8ZM6 1v3M10 1v3M14 1v3" />
                  </svg>
                </span>
                <span className="text-[var(--foreground-secondary)]">{t("coffee.navLabel")}</span>
              </Link>

              {/* Alias chip – mobile */}
              <AliasChip compact />
            </nav>
          </div>
        </div>
      ) : null}

    </>
  );
}