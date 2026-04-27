"use client";

import { useI18n } from "@/i18n/I18nContext";

export function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] text-[var(--muted)]">
      <span className="text-4xl" aria-hidden>
        ⚔
      </span>
      <p className="text-sm">{t("skills.emptyState")}</p>
    </div>
  );
}
