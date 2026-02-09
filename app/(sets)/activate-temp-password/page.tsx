"use client";
import React from "react";
import { useHabeasFlowStore } from "./_components/useHabeasFlowStore";
import ProteccionDatos from "./_components/habasdata/habeas";
import ActivateTempPassword from "./_components/activePassword/activePass";

export default function Page() {
  const showProteccionDatos = useHabeasFlowStore(
    (state) => state.showProteccionDatos,
  );

  return (
    <div>
      {showProteccionDatos ? <ProteccionDatos /> : <ActivateTempPassword />}
    </div>
  );
}
