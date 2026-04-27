"use client";

import { usePathname } from "next/navigation";
import { GameMainNav } from "@/components/GameMainNav";
import { SiteToolbar } from "@/components/SiteToolbar";

/**
 * Battle: only language/theme in the corner (no section bar).
 * /support: full-screen page, no nav.
 * Everything else: fixed main menu with nav + language/theme.
 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBattle = pathname?.startsWith("/battle/") ?? false;
  const isSupport = pathname?.startsWith("/support") ?? false;
  const showGameNav = !isBattle && !isSupport;
  const showSiteToolbar = isBattle || isSupport;

  return (
    <div className="flex min-h-0 min-h-full flex-1 flex-col">
      {showGameNav && <GameMainNav />}
      {showSiteToolbar && <SiteToolbar />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
