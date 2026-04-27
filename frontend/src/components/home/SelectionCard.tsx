import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import type { Warrior } from "@/lib/types";
import { focusRing } from "@/lib/ui";

export function SelectionCard({
  label,
  accent,
  selectedId,
  warriors,
  onClear,
}: {
  label: string;
  accent: "orange" | "sky";
  selectedId: string | null;
  warriors: Warrior[];
  onClear: () => void;
}) {
  const { t } = useI18n();
  const w = warriors.find((x) => x._id === selectedId);
  const accentRing =
    accent === "orange"
      ? "ring-orange-400/35 shadow-orange-500/10"
      : "ring-sky-400/35 shadow-sky-500/10";

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-3 shadow-lg backdrop-blur-md transition-[box-shadow] duration-200 ease-out sm:p-4 ${
        w
          ? `ring-1 ${accentRing} selection-slot-epic${accent === "sky" ? " selection-slot-epic--sky" : ""}`
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <p className="w-24 shrink-0 text-xs font-semibold uppercase leading-tight tracking-widest text-[var(--muted)] sm:w-28">
          {label}
        </p>
        <div className="min-w-0 flex-1">
          {w ? (
            <div className="flex items-center justify-end gap-2 sm:justify-start sm:gap-3">
              <WarriorPortrait
                slug={w.slug}
                imageUrl={w.imageUrl}
                nombre={w.nombre}
                className="h-16 w-14 shrink-0 sm:h-20 sm:w-16"
              />
              <div className="min-w-0 flex-1 text-right sm:text-left">
                <p className="truncate text-sm font-medium">{w.nombre}</p>
                <button
                  type="button"
                  className={`mt-1 text-xs font-medium underline-offset-4 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:underline ${focusRing} rounded ${
                    accent === "orange"
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--accent-cool)]"
                  }`}
                  onClick={onClear}
                >
                  {t("home.clearSelection")}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-right text-sm text-[var(--muted)] sm:text-left">
              {t("home.nobodyAssigned")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
