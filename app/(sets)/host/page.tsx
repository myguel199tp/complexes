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
    <div className="max-w-xl mx-auto space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Registrar reserva externa</h1>
        <p className="text-sm text-gray-600">
          Usa este formulario para registrar reservas realizadas por plataformas
          externas como <b>Airbnb</b>, <b>Booking</b> o por contacto directo.
          Esto bloqueará las fechas y mantendrá tu disponibilidad actualizada.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre del huésped</label>
          <input
            {...form.register("guestName")}
            placeholder="Ej: Juan Pérez"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha de entrada</label>
            <input
              type="date"
              {...form.register("startDate")}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha de salida</label>
            <input
              type="date"
              {...form.register("endDate")}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Huéspedes */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Número de huéspedes</label>
          <input
            type="number"
            min={1}
            {...form.register("guestsCount")}
            placeholder="Ej: 4"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Correo del huésped (opcional)
          </label>
          <input
            type="email"
            {...form.register("guestEmail")}
            placeholder="correo@ejemplo.com"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500">
            Solo para referencia interna. No se enviarán correos.
          </p>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="w-full bg-black text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isLoading
            ? "Registrando estadía..."
            : "Registrar estadía externa"}
        </button>
      </form>
    </div>
  );
}
