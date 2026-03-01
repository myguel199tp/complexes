"use client";

import React, { Suspense } from "react";
import SummaryImmovables from "./_components/summary-immovables";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryImmovables />
    </Suspense>
  );
}
