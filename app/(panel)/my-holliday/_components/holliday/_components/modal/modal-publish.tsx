import { Modal, Button, Text, InputField } from "complexes-next-components";
import React, { useEffect, useRef, useState } from "react";
import { PublishHollidayError } from "@/app/(panel)/my-holliday/services/hollidayPublishServices";
import { usePublishHolliday } from "./mutation-publish";
import {
  RNT_DOCUMENT_PATTERN,
  RNT_ERROR_HINTS,
  RNT_PATTERN,
  RNT_SIGNUP_URL,
  onlyDigits,
  requiresRnt,
} from "./rnt";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
  /** País del inmueble; decide si hay que pedir el RNT. */
  country?: string;
  /** RNT ya declarado en una publicación anterior, si lo hay. */
  rntNumber?: string;
  /**
   * Estado del cruce contra el registro público. Solo interesa `pending`: es
   * el que el anfitrión puede resolver aportando el documento del titular.
   */
  rntStatus?: string;
}

const ACCEPTED_RNT_FILES = "application/pdf,image/jpeg,image/png";
const MAX_RNT_FILE_MB = 10;

export default function ModalPublish({
  isOpen,
  onClose,
  hollidayId,
  country,
  rntNumber,
  rntStatus,
}: Props) {
  const { mutate, isPending } = usePublishHolliday();

  const needsRnt = requiresRnt(country);

  const [rnt, setRnt] = useState(rntNumber ?? "");
  const [document, setDocument] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // El modal vive montado en la tabla y se reutiliza para cada fila: sin esto
  // el RNT tecleado para un inmueble reaparecería al abrir el de otro.
  useEffect(() => {
    if (isOpen) {
      setRnt(rntNumber ?? "");
      setDocument("");
      setFile(null);
      setError(null);
      setHint(null);
    }
  }, [isOpen, rntNumber, hollidayId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    if (selected && selected.size > MAX_RNT_FILE_MB * 1024 * 1024) {
      setError(`El certificado no puede pesar más de ${MAX_RNT_FILE_MB} MB.`);
      event.target.value = "";
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handlePublish = () => {
    const value = onlyDigits(rnt);
    const holder = onlyDigits(document);

    if (needsRnt && !value) {
      setError("Ingresa tu número de RNT para poder publicar.");
      return;
    }

    if (value && !RNT_PATTERN.test(value)) {
      setError("El número de RNT solo admite dígitos.");
      return;
    }

    /**
     * El documento no es opcional en la práctica aunque el backend lo tolere:
     * sin él la verificación se queda en "pendiente" y el inmueble se pausa a
     * los pocos días. Mejor pedirlo ahora que despublicarlo después.
     */
    if (needsRnt && !RNT_DOCUMENT_PATTERN.test(holder)) {
      setError(
        "Ingresa el NIT o la cédula con la que inscribiste el RNT (solo dígitos).",
      );
      return;
    }

    setError(null);
    setHint(null);

    mutate(
      {
        hollidayId,
        rntNumber: value || undefined,
        rntHolderDocument: holder || undefined,
        rntFile: file,
      },
      {
        onSuccess: () => {
          onClose();
          alert("Inmueble publicado correctamente");
        },
        onError: (err) => {
          if (err instanceof PublishHollidayError) {
            setError(err.message);
            setHint(err.code ? (RNT_ERROR_HINTS[err.code] ?? null) : null);
            return;
          }

          setError("No se pudo publicar el inmueble. Inténtalo de nuevo.");
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar inmueble">
      <Text size="sm" className="mb-4">
        Al publicar este inmueble será visible para todos los usuarios. Para
        continuar por favor suministra la siguiente información
      </Text>

      {needsRnt && (
        <div className="mb-4 flex flex-col gap-2">
          <Text size="sm" font="semi">
            Registro Nacional de Turismo (RNT)
          </Text>

          {rntStatus === "pending" && (
            <Text size="xs" colVariant="warning">
              La verificación de este RNT quedó pendiente. Confirma el número y
              el documento del titular: si no se puede comprobar, la
              publicación se pausa a los pocos días.
            </Text>
          )}

          <Text size="xs">
            En Colombia la ley exige estar inscrito en el RNT para ofrecer
            alojamiento turístico. Verificamos el número contra el registro
            público del Ministerio de Comercio, Industria y Turismo, así que
            debe coincidir con tu certificado.
          </Text>

          <InputField
            placeholder="Ej. 123456"
            helpText="Número de RNT"
            sizeHelp="xs"
            inputSize="sm"
            regexType="number"
            value={rnt}
            onChange={(e) => setRnt(onlyDigits(e.target.value))}
            hasError={!!error && !rnt.trim()}
            disabled={isPending}
          />

          <InputField
            placeholder="Ej. 800078692"
            helpText="NIT o cédula del titular del RNT"
            sizeHelp="xs"
            inputSize="sm"
            regexType="number"
            value={document}
            onChange={(e) => setDocument(onlyDigits(e.target.value))}
            hasError={!!error && !document.trim()}
            disabled={isPending}
          />

          <div className="flex flex-col gap-1">
            <Text size="xs">
              Certificado del RNT (opcional, PDF o imagen, máx.{" "}
              {MAX_RNT_FILE_MB} MB)
            </Text>

            <input
              type="file"
              accept={ACCEPTED_RNT_FILES}
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isPending}
              className="text-xs"
            />
          </div>

          <a
            href={RNT_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline"
          >
            ¿No tienes RNT? Tramítalo aquí
          </a>
        </div>
      )}

      {error && (
        <div className="mb-3 flex flex-col gap-1">
          <Text size="sm" colVariant="danger">
            {error}
          </Text>

          {hint && <Text size="xs">{hint}</Text>}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          onClick={onClose}
          disabled={isPending}
          colVariant="danger"
          rounded="md"
        >
          Cancelar
        </Button>

        <Button
          onClick={handlePublish}
          disabled={isPending}
          colVariant="success"
        >
          {isPending ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </Modal>
  );
}
