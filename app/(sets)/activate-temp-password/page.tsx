"use client";
import { Suspense } from "react";
import ActivateTempPassword from "./_components/activePassword/activePass";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivateTempPassword />
    </Suspense>
  );
}
