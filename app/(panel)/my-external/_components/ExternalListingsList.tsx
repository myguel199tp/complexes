"use client";

import { Buton, Text } from "complexes-next-components";
import { MdLinkOff } from "react-icons/md";
import { useExternalListings } from "./use-external-query";
import { useDeactivateExternalMutation } from "./use-deactivate-mutation";
import { ExternalResponse } from "../services/response/externalResponse";

const platformLabel: Record<string, string> = {
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "VRBO",
};

interface Props {
  hollidayId: string;
  selectedListingId?: string;
  onSelectListing: (listing: ExternalResponse) => void;
}

export function ExternalListingsList({
  hollidayId,
  selectedListingId,
  onSelectListing,
}: Props) {
  const { data, isLoading } = useExternalListings(hollidayId);
  const deactivateMutation = useDeactivateExternalMutation(hollidayId);

  if (isLoading) {
    return <Text size="sm">Cargando plataformas...</Text>;
  }

  if (!data || data.length === 0) {
    return (
      <Text size="sm" className="text-gray-500">
        Aún no hay plataformas conectadas a esta unidad.
      </Text>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((listing) => (
        <div
          key={listing.id}
          className={`flex items-center justify-between gap-2 border rounded-md p-2 cursor-pointer ${
            selectedListingId === listing.id
              ? "border-cyan-600 bg-cyan-50"
              : "border-gray-200"
          }`}
          onClick={() => onSelectListing(listing)}
        >
          <div>
            <Text size="sm" className="font-semibold">
              {platformLabel[listing.platform] || listing.platform}
            </Text>
            <Text size="xs" className="text-gray-500 break-all">
              {listing.listingUrl}
            </Text>
            <Text size="xs" className="text-gray-500">
              Comisión de servicio: ${listing.serviceFee}
            </Text>
          </div>

          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            onClick={(e) => {
              e.stopPropagation();
              deactivateMutation.mutate(listing.id);
            }}
          >
            <MdLinkOff color="red" size={20} />
          </Buton>
        </div>
      ))}
    </div>
  );
}
