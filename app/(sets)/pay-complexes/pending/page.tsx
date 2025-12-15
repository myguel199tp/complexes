"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPendingPage() {
  const params = useSearchParams();
  const conjuntoId = params.get("conjuntoId");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/status?conjuntoId=${conjuntoId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.isActive) {
        clearInterval(interval);
        router.push(`/success`);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conjuntoId]);

  return (
    <div className="mt-20 text-center">
      <h2 className="text-xl font-bold">Procesando tu pago…</h2>
      <p>Esto puede tardar unos segundos.</p>
    </div>
  );
}
