import { Metadata } from "next";
import DeliveryLaryGuide from "./_components/delivery-lary-guide";

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
      {/* La guía de Lary es el único cliente del layout: decide sola en qué
          pantallas aparece. */}
      <DeliveryLaryGuide />
    </>
  );
}
