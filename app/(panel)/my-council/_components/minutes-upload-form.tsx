"use client";
import { FormEvent, useState } from "react";
import { Button, Text } from "complexes-next-components";
import { InputField, TextAreaField } from "@/app/components/ui/form";
import {
  useRecordMeetingMutation,
  useUploadMinutesMutation,
} from "./use-minutes-upload";

type Modality = "in_person" | "external_platform";

const MODALITIES: { key: Modality; label: string }[] = [
  { key: "in_person", label: "Presencial" },
  { key: "external_platform", label: "Otra plataforma" },
];

/** Lo mismo que acepta el backend: PDF o imagen, hasta 20 MB. */
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
const MAX_MB = 20;

interface Props {
  /**
   * Sin reunión, registra una nueva que ya se hizo por fuera. Con reunión,
   * le carga el acta a esa (pendiente, o finalizada sin firmas aún).
   */
  meetingId?: string;
  onSuccess?: () => void;
}

const today = () => new Date().toLocaleDateString("en-CA");

export default function MinutesUploadForm({ meetingId, onSuccess }: Props) {
  const recordMutation = useRecordMeetingMutation();
  const uploadMutation = useUploadMinutesMutation();
  const isPending = recordMutation.isPending || uploadMutation.isPending;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [modality, setModality] = useState<Modality>("in_person");
  const [platform, setPlatform] = useState("");
  const [summary, setSummary] = useState("");
  const [decisions, setDecisions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!meetingId && !title.trim()) {
      return setError("Escribe el título de la reunión");
    }
    if (!meetingId && !date) return setError("Indica la fecha de la reunión");
    if (modality === "external_platform" && !platform.trim()) {
      return setError("Indica en qué plataforma se hizo la reunión");
    }
    if (!file) return setError("Adjunta el acta de la reunión");
    if (file.size > MAX_MB * 1024 * 1024) {
      return setError(`El acta no puede pesar más de ${MAX_MB} MB`);
    }

    setError(null);

    const form = new FormData();
    form.append("file", file);
    form.append("modality", modality);
    if (modality === "external_platform") {
      form.append("externalPlatform", platform.trim());
    }
    if (summary.trim()) form.append("summary", summary.trim());
    if (decisions.trim()) form.append("decisions", decisions.trim());

    try {
      if (meetingId) {
        await uploadMutation.mutateAsync({ meetingId, form });
      } else {
        form.append("title", title.trim());
        // Mediodía local: la fecha no se corre de día al pasar a UTC.
        form.append("date", new Date(`${date}T12:00:00`).toISOString());
        await recordMutation.mutateAsync(form);
      }
    } catch {
      // El error ya lo muestra la alerta de la mutación.
      return;
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-6">
      <Text size="xs" className="text-gray-500 dark:text-gray-400">
        Para reuniones que se hicieron presenciales o en otra plataforma (Zoom,
        Meet, Teams…). Los miembros del consejo firman el acta que cargues; una
        vez alguien firme, ya no se puede reemplazar.
      </Text>

      {!meetingId && (
        <>
          <InputField
            regexType="safeChars"
            placeholder="Título de la reunión"
            helpText="Título"
            inputSize="sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha en que se hizo
            <input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
        </>
      )}

      <div className="space-y-1">
        <Text size="sm" className="font-medium text-gray-700 dark:text-gray-300">
          ¿Dónde se hizo?
        </Text>
        <div className="flex gap-2">
          {MODALITIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setModality(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                modality === key
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {modality === "external_platform" && (
        <InputField
          regexType="safeChars"
          placeholder="Zoom, Google Meet, Teams…"
          helpText="Plataforma"
          inputSize="sm"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          maxLength={80}
        />
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Acta (PDF o imagen, hasta {MAX_MB} MB)
        <input
          type="file"
          accept={ACCEPT}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 dark:text-gray-300 dark:file:bg-blue-950 dark:file:text-blue-300"
        />
      </label>

      <TextAreaField
        rows={3}
        className="w-full"
        placeholder="Resumen (opcional): de qué se habló, para quien no abra el documento"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        maxLength={5000}
      />
      <TextAreaField
        rows={3}
        className="w-full"
        placeholder="Decisiones (opcional)"
        value={decisions}
        onChange={(e) => setDecisions(e.target.value)}
        maxLength={10000}
      />

      {error && (
        <Text size="sm" className="text-red-600 dark:text-red-400">
          {error}
        </Text>
      )}

      <Button
        type="submit"
        size="full"
        colVariant="success"
        rounded="md"
        disabled={isPending}
      >
        {isPending
          ? "Cargando..."
          : meetingId
            ? "Cargar acta"
            : "Registrar reunión"}
      </Button>
    </form>
  );
}
