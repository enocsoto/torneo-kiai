"use client";

import dynamic from "next/dynamic";

export const DynamicJoyride = dynamic(
  () => import("react-joyride").then((m) => m.default),
  { ssr: false, loading: () => null },
);
