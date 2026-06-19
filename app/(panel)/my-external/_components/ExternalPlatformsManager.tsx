"use client";

import { useState } from "react";
import { Text, Title } from "complexes-next-components";
import { ExternalListingForm } from "./ExternalListingForm";
import { ExternalListingsList } from "./ExternalListingsList";
import { ExternalStaysPanel } from "./ExternalStaysPanel";
import { ExternalResponse } from "../services/response/externalResponse";

export function ExternalPlatformsManager({
  hollidayId,
}: {
  hollidayId: string;
}) {
  const [selectedListing, setSelectedListing] =
    useState<ExternalResponse | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Title as="h4" size="sm" font="bold" className="mb-2">
          Conectar nueva plataforma
        </Title>
        <ExternalListingForm hollidayId={hollidayId} />

        <Title as="h4" size="sm" font="bold" className="mt-4 mb-2">
          Plataformas conectadas
        </Title>
        <ExternalListingsList
          hollidayId={hollidayId}
          selectedListingId={selectedListing?.id}
          onSelectListing={setSelectedListing}
        />
      </div>

      <div>
        {selectedListing ? (
          <ExternalStaysPanel externalListingId={selectedListing.id} />
        ) : (
          <Text size="sm" className="text-gray-500">
            Selecciona una plataforma conectada para ver o registrar sus
            reservas externas.
          </Text>
        )}
      </div>
    </div>
  );
}
