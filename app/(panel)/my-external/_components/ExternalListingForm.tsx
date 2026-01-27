"use client";

import { useForm } from "react-hook-form";

type ExternalPlatform = "AIRBNB" | "BOOKING" | "VRBO";

interface FormValues {
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
}

export function ExternalListingForm({ hollidayId }: { hollidayId: string }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/external-listings/${hollidayId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer TOKEN_DEL_USUARIO",
        },
        body: JSON.stringify(data),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold">Conectar plataforma</h2>

      <select {...register("platform")} required>
        <option value="">Selecciona plataforma</option>
        <option value="AIRBNB">Airbnb</option>
        <option value="BOOKING">Booking</option>
        <option value="VRBO">VRBO</option>
      </select>

      <input
        {...register("listingUrl")}
        placeholder="URL del anuncio"
        required
      />

      <input
        {...register("externalId")}
        placeholder="ID del anuncio (opcional)"
      />

      <input {...register("icalUrl")} placeholder="URL iCal (opcional)" />

      <button type="submit" disabled={isSubmitting}>
        Conectar
      </button>
    </form>
  );
}
