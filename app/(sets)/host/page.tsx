"use client";

import { useCreateExternalStay } from "./_components/externalStaymutations";
import { useExternalStayForm } from "./_components/useExternalStayForm";

export default function ExternalStayPage({ params }) {
  const form = useExternalStayForm();
  const mutation = useCreateExternalStay();

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({
      listingId: params.listingId,
      data,
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("guestName")} placeholder="Nombre huésped" />
      <input type="date" {...form.register("startDate")} />
      <input type="date" {...form.register("endDate")} />
      <input type="number" {...form.register("guestsCount")} />
      <input {...form.register("guestEmail")} />

      <button type="submit">Registrar estadía</button>
    </form>
  );
}
