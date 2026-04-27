"use client";

import { useI18n } from "@/i18n/I18nContext";
import { useApiOnline } from "@/hooks/useApiOnline";

export function ConnectionBanner() {
  const { t } = useI18n();
  const online = useApiOnline(12000);

  if (online) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-center text-sm text-[var(--status-error-fg)] shadow-lg backdrop-blur-md [padding-bottom:max(0.75rem,env(safe-area-inset-bottom,0px))]"
      role="alert"
      aria-live="assertive"
    >
      {t("connection.offline")}
    </div>
  );
}
