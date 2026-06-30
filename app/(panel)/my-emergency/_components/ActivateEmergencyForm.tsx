"use client";

import { useState } from "react";
import { Button, InputField, SelectField, TextAreaField } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EmergencyType } from "../services/response/emergencyResponse";
import { useActivateEmergency } from "./useEmergency";

const TYPE_OPTIONS = [
  { label: "Terremoto", value: EmergencyType.EARTHQUAKE },
  { label: "Incendio", value: EmergencyType.FIRE },
  { label: "Explosión", value: EmergencyType.EXPLOSION },
  { label: "Inundación", value: EmergencyType.FLOOD },
  { label: "Deslizamiento", value: EmergencyType.LANDSLIDE },
  { label: "Falla estructural", value: EmergencyType.STRUCTURAL_FAILURE },
  { label: "Emergencia médica masiva", value: EmergencyType.MASS_MEDICAL },
  { label: "Otra", value: EmergencyType.OTHER },
];

const DEFAULT_INSTRUCTIONS: Record<EmergencyType, string> = {
  [EmergencyType.EARTHQUAKE]:
    "Mantenga la calma. Aléjese de ventanas y objetos que puedan caer. Ubíquese bajo una mesa resistente o en el marco de una puerta. No use ascensores. Espere a que cese el movimiento antes de evacuar.",
  [EmergencyType.FIRE]:
    "Mantenga la calma. Active la alarma de incendio y llame al 123. No use ascensores. Descienda por las escaleras de emergencia agachado para evitar el humo. Cierre puertas al salir para contener el fuego. Diríjase al punto de encuentro.",
  [EmergencyType.EXPLOSION]:
    "Mantenga la calma. Aléjese del área afectada y evite zonas con humo o escombros. No encienda llamas ni dispositivos eléctricos. Llame al 123. Espere instrucciones del personal de emergencia.",
  [EmergencyType.FLOOD]:
    "Mantenga la calma. Suba a los pisos más altos del edificio. No intente cruzar zonas inundadas. Desconecte aparatos eléctricos si es seguro hacerlo. Espere la señal de evacuación del personal autorizado.",
  [EmergencyType.LANDSLIDE]:
    "Mantenga la calma. Aléjese de ventanas y paredes externas. Diríjase a las zonas internas del edificio alejadas de la dirección del deslizamiento. Siga las instrucciones del personal de emergencia.",
  [EmergencyType.STRUCTURAL_FAILURE]:
    "Mantenga la calma. Evacue el edificio de inmediato por las rutas de emergencia. No use ascensores. No regrese a buscar pertenencias. Llame al 123 y espere al personal de emergencia en el punto de encuentro.",
  [EmergencyType.MASS_MEDICAL]:
    "Mantenga la calma. Llame al 123 de inmediato. No mueva a personas heridas a menos que estén en peligro inmediato. Despeje el área para facilitar el acceso de paramédicos. Siga las instrucciones del personal de salud.",
  [EmergencyType.OTHER]:
    "Mantenga la calma. Siga las instrucciones del personal de emergencia. No abandone el edificio a menos que se indique. Esté atento a las comunicaciones oficiales.",
};

export default function ActivateEmergencyForm() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const activateMutation = useActivateEmergency(conjuntoId);

  const [type, setType] = useState<EmergencyType>(EmergencyType.FIRE);
  const [customTypeLabel, setCustomTypeLabel] = useState("");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS[EmergencyType.FIRE]);
  const [evacuationRoute, setEvacuationRoute] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleActivate = () => {
    activateMutation.mutate(
      {
        type,
        customTypeLabel: type === EmergencyType.OTHER ? customTypeLabel : undefined,
        instructions: instructions || undefined,
        evacuationRoute: evacuationRoute || undefined,
        meetingPoint: meetingPoint || undefined,
      },
      {
        onSuccess: () => setConfirming(false),
      },
    );
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <h2 className="text-lg font-semibold text-red-700">
        🚨 Activar una emergencia
      </h2>
      <p className="mt-1 text-sm text-red-600">
        Notificará de inmediato a todos los residentes y abrirá el chat del
        asistente para verificar su estado.
      </p>

      <div className="mt-4 space-y-3">
        <SelectField
          label="Tipo de emergencia"
          inputSize="md"
          rounded="md"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selected = e.target.value as EmergencyType;
            setType(selected);
            setInstructions(DEFAULT_INSTRUCTIONS[selected]);
          }}
        />

        {type === EmergencyType.OTHER && (
          <InputField
            label="Describe el tipo de emergencia"
            value={customTypeLabel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCustomTypeLabel(e.target.value)
            }
          />
        )}

        <TextAreaField
          label="Instrucciones para residentes"
          value={instructions}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInstructions(e.target.value)
          }
        />

        <InputField
          label="Ruta de evacuación (opcional)"
          value={evacuationRoute}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEvacuationRoute(e.target.value)
          }
        />

        <InputField
          label="Punto de encuentro (opcional)"
          value={meetingPoint}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMeetingPoint(e.target.value)
          }
        />

        {activateMutation.error && (
          <p className="text-sm text-red-700">
            {activateMutation.error.message}
          </p>
        )}

        {!confirming ? (
          <Button
            size="full"
            colVariant="danger"
            onClick={() => setConfirming(true)}
          >
            Activar emergencia
          </Button>
        ) : (
          <div className="space-y-2 rounded-xl border border-red-300 bg-white p-3">
            <p className="text-sm font-medium text-red-700">
              ¿Confirmas que quieres activar esta emergencia? Se notificará a
              todos los residentes ahora mismo.
            </p>
            <div className="flex gap-2">
              <Button
                size="full"
                colVariant="danger"
                disabled={activateMutation.isPending}
                onClick={handleActivate}
              >
                {activateMutation.isPending ? "Activando..." : "Sí, activar"}
              </Button>
              <Button
                size="full"
                colVariant="primary"
                onClick={() => setConfirming(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
