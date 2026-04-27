import { useI18n } from "@/i18n/I18nContext";
import { focusRing, pressScale } from "@/lib/ui";

interface HomeHeaderProps {
  localTwoPlayer: boolean;
  onLocalTwoPlayerChange: (v: boolean) => void;
  onStartOopTour: () => void;
}

export function HomeHeader({
  localTwoPlayer,
  onLocalTwoPlayerChange,
  onStartOopTour,
}: HomeHeaderProps) {
  const { t } = useI18n();
  return (
    <header
      className="space-y-2.5 text-center sm:text-left"
      data-ooptour="home-intro"
    >
      <p className="text-balance text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent-text)]">
        {t("home.kicker")}
      </p>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h1 className="min-w-0 flex-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("home.title")}
        </h1>
        <div className="flex shrink-0 justify-center sm:justify-end sm:pt-0.5">
          <button
            type="button"
            data-testid="home-oop-start-tour"
            onClick={onStartOopTour}
            className={`group relative inline-flex w-full min-w-0 max-w-md items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-amber-500/50 bg-gradient-to-b from-amber-500/[0.18] via-[var(--accent)]/[0.16] to-orange-950/[0.12] px-4 py-2.5 text-center text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--foreground)] shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_28px_rgba(234,88,12,0.22),0_10px_28px_rgba(0,0,0,0.2)] sm:w-auto sm:min-w-[12rem] ${pressScale} ${focusRing} before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-amber-200/10 before:to-transparent before:opacity-0 motion-safe:before:translate-x-[-100%] motion-safe:transition-transform motion-reduce:before:translate-x-0 motion-reduce:before:opacity-30 html-[data-theme=light]:border-amber-600/45 html-[data-theme=light]:from-amber-200/50 html-[data-theme=light]:via-orange-200/40 html-[data-theme=light]:to-amber-100/30 html-[data-theme=light]:shadow-[0_0_0_1px_rgba(194,65,12,0.2),0_0_20px_rgba(234,88,12,0.12),0_8px_20px_rgba(15,23,42,0.08)] [@media(hover:hover)_and_(pointer:fine)]:hover:border-amber-400/60 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_0_1px_rgba(253,186,116,0.35),0_0_40px_rgba(251,146,60,0.35),0_12px_32px_rgba(0,0,0,0.25)] motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:before:translate-x-full motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:before:opacity-100`}
            aria-label={t("oop.startTour")}
          >
            <span
              className="pointer-events-none relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-950/40 text-[var(--log-replay-amber-bright)] ring-1 ring-amber-400/30 transition-transform duration-200 group-active:scale-95 [html[data-theme=light]_&]:bg-amber-500/20 [html[data-theme=light]_&]:text-[var(--accent-text)] sm:h-7 sm:w-7"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28.148c0-.21-.1-.4-.25-.51l-5-3.5A.75.75 0 0 0 10.25 8.5V15.5a.75.75 0 0 0 1.12.648l5-3.5a.75.75 0 0 0 .12-.4Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="relative z-10 [text-shadow:0_1px_2px_rgba(255,255,255,0.15)] [html[data-theme=light]_&]:[text-shadow:0_1px_0_rgba(255,255,255,0.8)]">
              {t("oop.startTour")}
            </span>
          </button>
        </div>
      </div>
      <p className="w-full max-w-5xl text-pretty leading-relaxed text-[var(--muted)]">
        {t("home.subtitle")}
      </p>
      <p className="w-full max-w-5xl text-pretty text-sm leading-relaxed text-[var(--muted)]">
        {t("home.progressHint")}
      </p>
      <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:border-0 sm:pt-0">
        <label className="flex cursor-pointer items-center justify-center gap-2 sm:justify-start">
          <input
            type="checkbox"
            data-testid="local-two-player"
            checked={localTwoPlayer}
            onChange={(e) => onLocalTwoPlayerChange(e.target.checked)}
            className="size-4 shrink-0 rounded border-[var(--border-muted)] bg-[var(--control-fill)] text-[var(--accent)] focus:ring-[var(--ring-focus)]/50"
          />
          <span className="text-left text-sm text-[var(--foreground-secondary)]">
            {t("home.couchMode")}
          </span>
        </label>
      </div>
    </header>
  );
}
