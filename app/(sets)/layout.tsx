import { Metadata } from "next";

/**
 * Grupo de flujos transaccionales: registro, activación de cuenta, OTP,
 * recuperación de contraseña, pagos y firma. Ninguna de estas URLs debe
 * aparecer en buscadores, así que el noindex se declara una sola vez aquí en
 * lugar de repetirlo en cada pantalla.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
