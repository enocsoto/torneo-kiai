"use client";

import { AppFrame } from "@/components/AppFrame";
import { AppToaster } from "@/components/AppToaster";
import { ConnectionBanner } from "@/components/ConnectionBanner";
import { IdentityGate } from "@/components/identity/IdentityGate";
import { I18nProvider } from "@/i18n/I18nContext";
import { OopLearningProvider } from "@/i18n/OopLearningContext";
import { ThemeProvider } from "@/theme/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <OopLearningProvider>
          <div
            data-app-shell
            className="min-h-full flex min-h-0 flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]"
          >
            <IdentityGate>
              <AppFrame>{children}</AppFrame>
            </IdentityGate>
          </div>
          <ConnectionBanner />
          <AppToaster />
        </OopLearningProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
