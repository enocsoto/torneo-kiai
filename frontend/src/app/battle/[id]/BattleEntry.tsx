"use client";

import BattlePageClient from "./BattlePageClient";

type Props = { id: string };

export default function BattleEntry({ id }: Props) {
  return <BattlePageClient idParam={id} />;
}
