import { useI18n } from "@/i18n/I18nContext";
import { focusRing } from "@/lib/ui";

export function ErrorBanner({
  error,
  onDismiss,
  onRetry,
}: {
  error: string;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg)] shadow-lg shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span className="text-pretty">{error}</span>
      <button
        type="button"
        onClick={() => {
          onDismiss();
          void onRetry();
        }}
        className={`shrink-0 rounded-lg border border-[var(--status-error-button-border)] bg-[var(--status-error-button-bg)] px-3 py-2 text-xs font-semibold text-[var(--status-error-fg)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--status-error-button-hover)] ${focusRing}`}
      >
        {t("common.retry")}
      </button>
    </div>
  );
}
