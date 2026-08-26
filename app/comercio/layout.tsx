import type { Metadata } from "next";
import ComercioAssistantFab from "./_components/assistant-fab";

export const metadata: Metadata = {
  title: "Comercio | globaliaph",
};

/**
 * Layout común del dominio comercio.
 *
 * Existe para que el asistente sea alcanzable desde cualquier pantalla. Se
 * mantiene como componente de servidor y el botón —que necesita la ruta
 * actual— es el único cliente, para no arrastrar las páginas hijas ni los
 * `metadata` de login y registro al bundle del navegador.
 */
export default function ComercioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ComercioAssistantFab />
    </>
  );
}
