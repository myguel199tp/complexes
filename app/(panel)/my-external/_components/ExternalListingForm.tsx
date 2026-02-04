"use client";

import {
  Button,
  InputField,
  SelectField,
  Tooltip,
} from "complexes-next-components";
import { useForm, Controller } from "react-hook-form";
import { IoIosHelpCircle } from "react-icons/io";

type ExternalPlatform = "AIRBNB" | "BOOKING" | "VRBO";

interface FormValues {
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
}

export function ExternalListingForm() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const platform = watch("platform");

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  /* ======================
     HELPERS POR PLATAFORMA
     ====================== */

  const listingUrlHelpByPlatform: Record<ExternalPlatform, JSX.Element> = {
    AIRBNB: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Airbnb</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Abre tu anuncio en Airbnb.</li>
          <li>Copia la URL del navegador.</li>
          <li>
            Ejemplo:
            <br />
            <code className="text-[10px]">
              https://www.airbnb.com/rooms/12345678
            </code>
          </li>
        </ul>
      </div>
    ),

    BOOKING: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Booking.com</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Ingresa a Booking Extranet.</li>
          <li>Abre tu alojamiento.</li>
          <li>Copia el enlace del anuncio.</li>
        </ul>
      </div>
    ),

    VRBO: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Vrbo</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Abre tu anuncio en Vrbo.</li>
          <li>
            Ejemplo:
            <br />
            <code className="text-[10px]">https://www.vrbo.com/1234567</code>
          </li>
        </ul>
      </div>
    ),
  };

  const icalHelpByPlatform: Record<ExternalPlatform, JSX.Element> = {
    AIRBNB: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Airbnb</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Anuncio → Calendario.</li>
          <li>Disponibilidad.</li>
          <li>Exportar calendario.</li>
          <li>
            Copia el enlace <code>.ics</code>.
          </li>
          <li>
            Ejemplo:
            <br />
            <code className="text-[10px]">
              https://www.airbnb.com/calendar/ical/12345678.ics
            </code>
          </li>
        </ul>
      </div>
    ),

    BOOKING: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Booking.com</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Extranet → Calendario.</li>
          <li>Sincronización de calendarios.</li>
          <li>Exportar calendario.</li>
        </ul>
      </div>
    ),

    VRBO: (
      <div className="max-w-xs text-xs space-y-2">
        <strong>Vrbo</strong>
        <ul className="list-disc list-inside space-y-1">
          <li>Dashboard → Propiedad.</li>
          <li>Calendario → Calendar Sync.</li>
          <li>Export Calendar.</li>
        </ul>
      </div>
    ),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Plataforma */}
      <Controller
        name="platform"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SelectField
            id="platform"
            tKeyDefaultOption="Plataforma"
            tKeyHelpText="Plataforma"
            helpText="Selecciona la plataforma externa"
            sizeHelp="xs"
            inputSize="md"
            rounded="lg"
            options={[
              { value: "AIRBNB", label: "Airbnb" },
              { value: "BOOKING", label: "Booking" },
              { value: "VRBO", label: "VRBO" },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* URL del anuncio */}
      <Controller
        name="listingUrl"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <InputField
            id="listingUrl"
            tKeyPlaceholder="URL del anuncio"
            prefixElement={
              platform ? (
                <Tooltip
                  content={listingUrlHelpByPlatform[platform]}
                  position="right"
                  className="bg-gray-200 w-64"
                >
                  <IoIosHelpCircle size={20} className="text-gray-400" />
                </Tooltip>
              ) : null
            }
            tKeyHelpText="URL del anuncio"
            helpText="Enlace público del anuncio"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="https://www.airbnb.com/..."
            type="text"
            value={field.value || ""}
            onChange={field.onChange}
          />
        )}
      />

      {/* External ID */}
      <Controller
        name="externalId"
        control={control}
        render={({ field }) => (
          <InputField
            id="externalId"
            tKeyPlaceholder="ID del anuncio"
            tKeyHelpText="ID del anuncio"
            helpText="Opcional"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="12345678"
            type="text"
            value={field.value || ""}
            onChange={field.onChange}
          />
        )}
      />

      {/* iCal URL */}
      <Controller
        name="icalUrl"
        control={control}
        render={({ field }) => (
          <InputField
            id="icalUrl"
            prefixElement={
              platform ? (
                <Tooltip
                  content={icalHelpByPlatform[platform]}
                  position="right"
                  className="bg-gray-200 w-64"
                >
                  <IoIosHelpCircle size={20} className="text-gray-400" />
                </Tooltip>
              ) : null
            }
            tKeyPlaceholder="URL iCal"
            tKeyHelpText="URL iCal"
            helpText="Sincronización de calendario (opcional)"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="https://www.airbnb.com/calendar/ical/..."
            type="text"
            value={field.value || ""}
            onChange={field.onChange}
          />
        )}
      />

      {/* Botón */}
      <Button
        type="submit"
        size="full"
        colVariant="warning"
        disabled={isSubmitting}
      >
        Conectar
      </Button>
    </form>
  );
}
