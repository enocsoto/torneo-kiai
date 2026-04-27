"use client";

import { Suspense } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { PlayOnlineClient } from "./PlayOnlineClient";

export default function PlayOnlinePage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center p-8 text-[var(--muted)]">
          {t("common.loading")}
        </div>
      }
    >
      <PlayOnlineClient />
    </Suspense>
  );
}
