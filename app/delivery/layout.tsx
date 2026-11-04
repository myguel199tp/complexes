import { Metadata } from "next";
import DeliveryLaryGuide from "./_components/delivery-lary-guide";
import WebPushPrompt from "../components/web-push/web-push-prompt";

/**
 * Dominio del repartidor: cuenta creada por el comercio, sin registro público.
 * Fuera del índice, como el resto de paneles con sesión.
 */
export const metadata: Metadata = {
  title: "Repartidor",
  robots: { index: false, follow: false },
};

export default function DeliveryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {/* La guía de Lary y el aviso de notificaciones deciden solos en qué
          pantallas aparecen: en login y activación no hay sesión. */}
      <DeliveryLaryGuide />
      <WebPushPrompt
        kind="delivery"
        onlyOn={["/delivery/orders", "/delivery/runs"]}
      />
    </>
  );
}
