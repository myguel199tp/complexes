"use client";

import dynamic from "next/dynamic";
import { Text } from "complexes-next-components";

const Sign = dynamic(() => import("./sign/sign"), {
  ssr: false,
  loading: () => <Text size="sm">Cargando...</Text>,
});

export default function Page() {
  return <Sign />;
}
