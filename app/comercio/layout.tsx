import type { Metadata } from "next";
import ComercioAssistantFab from "./_components/assistant-fab";
import ComercioLaryGuide from "./_components/comercio-lary-guide";
import ComercioShell from "./_components/comercio-shell";
import WebPushPrompt from "../components/web-push/web-push-prompt";

export const metadata: Metadata = {
  title: "Comercio",
  // Panel privado del comercio aliado: nada de esto va al índice.
  robots: { index: false, follow: false },
};

/**
 * Layout común del dominio comercio.
 *
 * Existe para que el menú lateral, el asistente y la guía de Lary sean
 * alcanzables desde cualquier pantalla. Se mantiene como componente de
 * servidor y el marco y los botones —que necesitan la ruta actual— son los
 * únicos clientes, para no arrastrar las páginas hijas ni los `metadata` de
 * login y registro al bundle del navegador.
 */
export default function ComercioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ComercioShell>{children}</ComercioShell>
      <ComercioAssistantFab />
      <ComercioLaryGuide />
      {/* Pedidos y avisos B2B en el navegador. Sin sesión en login y registro. */}
      <WebPushPrompt
        kind="comercio"
        hideOn={["/comercio/login", "/comercio/register"]}
      />
    </>
  );
}
