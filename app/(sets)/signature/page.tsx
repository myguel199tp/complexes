"use client";

import dynamic from "next/dynamic";

const Sign = dynamic(() => import("./sign/sign"), {
  ssr: false,
  loading: () => <p>Cargando...</p>,
});

export default function Page() {
  return <Sign />;
}
