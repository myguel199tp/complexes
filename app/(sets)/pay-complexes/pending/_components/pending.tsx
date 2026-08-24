"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { Text } from "complexes-next-components";

export default function PaymentPendingPage() {
  const params = useSearchParams();
  const conjuntoId = params.get("conjuntoId");
  const router = useRouter();

  useEffect(() => {
    if (!conjuntoId) return;

    const interval = setInterval(async () => {
      const res = await fetchWithAuth(
        `/api/payment/status?conjuntoId=${conjuntoId}`,
        {
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (data?.isActive) {
        clearInterval(interval);
        router.push("/success");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conjuntoId, router]);

  return (
    <div className="mt-20 text-center">
      <Text as="h2" size="md" font="bold">Procesando tu pago…</Text>
      <Text size="sm">Esto puede tardar unos segundos.</Text>
    </div>
  );
}
