"use client";

import { toast } from "sonner";

/**
 * Same pattern as `victoryToastSonnerOpts` in `useBattle`: Sonner’s `li` stays
 * transparent and the real chrome lives in the inner `div`.
 */
export const EPIC_SONNER_SHELL = {
  duration: 6200,
  classNames: {
    toast:
      "!border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none rounded-2xl",
  },
} as const;

export type EpicSuccessPayload = {
  kicker: string;
  title: string;
  sub?: string;
};

export function showEpicSuccessToast({ kicker, title, sub }: EpicSuccessPayload) {
  toast.custom(
    () => (
      <div className="epic-success-toast" role="status" aria-live="polite">
        <div className="epic-success-toast-shimmer" aria-hidden />
        <div className="epic-success-toast-icon" aria-hidden>
          ✦
        </div>
        <div className="min-w-0">
          <p className="epic-success-toast-kicker">{kicker}</p>
          <p className="epic-success-toast-title">{title}</p>
          {sub ? <p className="epic-success-toast-sub">{sub}</p> : null}
        </div>
      </div>
    ),
    EPIC_SONNER_SHELL,
  );
}
