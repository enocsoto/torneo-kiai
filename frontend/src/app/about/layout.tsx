import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de — Torneo Kiai",
  description:
    "Información del proyecto, autor (Enoc Soto) y aviso legal sobre obras de aficionado y marcas de terceros.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
