"use client";

import React from "react";
import PlansPricing from "./_components/plans-pricing";
import FaqAccordion from "@/app/components/ui/faq/faq-accordion";

/** Preguntas de `locales/*.json` que responden objeciones de precio. */
const PRICING_FAQ_INDEXES = [0, 1, 2, 4, 18, 19, 20, 21, 22, 36];

export default function PlanesPage() {
  return (
    <>
      <PlansPricing />

      <FaqAccordion
        indexes={PRICING_FAQ_INDEXES}
        title="Dudas sobre el precio"
        subtitle="Lo que más nos preguntan antes de firmar."
      />
    </>
  );
}
