"use client";

import { useForm } from "react-hook-form";

interface FormValues {
  guestName: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
}

export function ExternalStayForm({
  externalListingId,
}: {
  externalListingId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/external-stays/${externalListingId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-listing-key": "SECRET_KEY_DEL_LISTING",
        },
        body: JSON.stringify(data),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold">Registrar estadía externa</h2>

      <input
        {...register("guestName")}
        placeholder="Nombre del huésped"
        required
      />

      <input type="date" {...register("startDate")} required />

      <input type="date" {...register("endDate")} required />

      <input
        type="number"
        {...register("guestsCount", { valueAsNumber: true })}
        min={1}
        required
      />

      <button type="submit" disabled={isSubmitting}>
        Registrar estadía
      </button>
    </form>
  );
}
