"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/theme/ThemeContext";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      richColors
      position="top-center"
      closeButton
      duration={4800}
      toastOptions={{
        classNames: {
          toast:
            "border border-[var(--tooltip-border)] bg-[var(--tooltip-bg)] text-[var(--foreground)] shadow-2xl backdrop-blur-md overflow-hidden",
          title: "font-semibold",
          description: "text-[var(--muted)]",
        },
      }}
    />
  );
}
