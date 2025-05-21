import React, { Suspense } from "react";
import SummaryImmovables from "./_components/summary-immovables";

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>Cargando...</div>}>
        <SummaryImmovables />
      </Suspense>
    </div>
  );
}
