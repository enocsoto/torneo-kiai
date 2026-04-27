import { useI18n } from "@/i18n/I18nContext";
import { focusRing, hoverLift, pressScale } from "@/lib/ui";

const startButtonClass = `rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-orange-500/25 transition-[transform,opacity,box-shadow] duration-200 ease-out motion-reduce:transition-none ${pressScale} ${focusRing} disabled:pointer-events-none disabled:opacity-40 ${hoverLift}`;

interface StartBattleBarProps {
  canStart: boolean;
  starting: boolean;
  onStart: () => void;
}

export function StartBattleBar({ canStart, starting, onStart }: StartBattleBarProps) {
  const { t } = useI18n();
  const label = starting ? t("home.starting") : t("home.start");

  return (
    <>
      <div
        className={`flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center ${canStart ? "max-md:hidden" : ""}`}
      >
        <button
          type="button"
          data-testid="start-battle"
          data-ooptour="home-start-battle"
          disabled={!canStart || starting}
          onClick={onStart}
          className={startButtonClass}
        >
          {label}
        </button>
      </div>

      {canStart ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[135] md:hidden">
          <div className="pointer-events-auto border-t border-[var(--border-subtle)] bg-[var(--background)]/95 px-3 pt-2 shadow-[0_-4px_28px_rgba(0,0,0,0.2)] backdrop-blur-md [padding-bottom:max(0.75rem,env(safe-area-inset-bottom,0px))] dark:shadow-[0_-4px_32px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              data-testid="start-battle-mobile"
              data-ooptour="home-start-battle-mobile"
              disabled={starting}
              onClick={onStart}
              className={`${startButtonClass} w-full touch-manipulation py-4 text-base`}
            >
              {label}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
