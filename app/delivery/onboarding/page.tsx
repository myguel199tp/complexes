"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputField, Text, Title } from "complexes-next-components";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import {
  DOCUMENT_TYPE_LABELS,
  completeOnboarding,
  getDeliveryProfile,
  type DeliveryDocumentType,
} from "../services/deliveryOrdersService";
import FaceCapture from "./_components/face-capture";

/** Lo que acepta el backend para el documento. */
const DOCUMENT_ACCEPT = "image/*,application/pdf";
const MAX_DOCUMENT_MB = 10;

const DOCUMENT_TYPES = Object.keys(
  DOCUMENT_TYPE_LABELS,
) as DeliveryDocumentType[];

/**
 * Identificación del repartidor.
 *
 * El comercio da de alta un nombre, un correo y un teléfono; nada de eso dice
 * quién es la persona que después toca timbres a nombre del comercio y recibe
 * efectivo en la puerta. Y el comercio no puede acreditarlo —no tiene el
 * documento de su repartidor—, así que se pide aquí, en el primer ingreso, que
 * es el único momento en que la persona está del otro lado.
 *
 * Va después de poner la contraseña y antes de ver un solo pedido: el backend
 * rechaza los pedidos de quien no pasó por aquí.
 */
export default function DeliveryOnboardingPage() {
  const router = useRouter();
  const { session, isLoading } = useDeliveryGuard(() =>
    router.push("/delivery/login"),
  );

  const [photo, setPhoto] = useState<Blob | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DeliveryDocumentType>("cc");
  const [documentNumber, setDocumentNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // Quien ya se identificó no tiene nada que hacer aquí: el paso es
  // irrepetible, así que se le devuelve a sus pedidos en vez de dejarle llenar
  // un formulario que el backend va a rechazar.
  useEffect(() => {
    if (!session) return;

    getDeliveryProfile()
      .then((profile) => {
        if (profile.onboardingCompleted) router.replace("/delivery/orders");
      })
      .catch(() => undefined);
  }, [session, router]);

  function pickDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (file && file.size > MAX_DOCUMENT_MB * 1024 * 1024) {
      setError(`El archivo del documento no puede pesar más de ${MAX_DOCUMENT_MB} MB.`);
      setDocumentFile(null);
      return;
    }

    setDocumentFile(file);
  }

  const canSubmit =
    !!photo && !!documentFile && documentNumber.trim().length >= 5;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!photo || !documentFile) return;

    setError(null);
    setSubmitting(true);

    try {
      await completeOnboarding({
        photo,
        document: documentFile,
        documentType,
        documentNumber: documentNumber.trim(),
      });

      router.replace("/delivery/orders");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos guardar tu identificación",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Text size="sm" className="text-slate-400">
          Cargando...
        </Text>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          <Title as="h1" size="sm" font="bold" colVariant="on">
            Identifícate
          </Title>
          <Text size="sm" className="mt-2 text-slate-400">
            Antes de recibir tu primer pedido necesitamos saber quién eres: los
            clientes te abren la puerta y te entregan dinero en la mano.
          </Text>

          <form className="mt-7 space-y-7" onSubmit={handleSubmit}>
            <section className="space-y-3">
              <Text size="sm" className="font-semibold text-white">
                1. Tu foto
              </Text>
              <Text size="xs" className="text-slate-500">
                Se toma ahora con la cámara, no se puede subir de la galería.
              </Text>

              <FaceCapture value={photo} onChange={setPhoto} />
            </section>

            <section className="space-y-4">
              <Text size="sm" className="font-semibold text-white">
                2. Tu documento
              </Text>

              <div className="grid grid-cols-2 gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocumentType(type)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      documentType === type
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {DOCUMENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              <InputField
                placeholder="Número de documento"
                helpText="Número de documento"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                inputMode="text"
                value={documentNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDocumentNumber(e.target.value)
                }
              />

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 transition hover:border-white/30">
                <IoDocumentTextOutline size={20} className="text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                  {documentFile
                    ? documentFile.name
                    : "Adjunta una foto o el PDF de tu documento"}
                </span>
                <input
                  type="file"
                  accept={DOCUMENT_ACCEPT}
                  className="hidden"
                  onChange={pickDocument}
                />
              </label>
            </section>

            {error ? (
              <Text size="sm" colVariant="danger">
                {error}
              </Text>
            ) : null}

            <Button
              type="submit"
              colVariant="success"
              size="md"
              rounded="md"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Enviar y empezar"}
            </Button>
          </form>

          <Text size="xs" className="mt-6 text-center text-slate-500">
            Tu foto y tu documento son privados: sólo los ven los comercios que
            te contratan. No aparecen en ninguna dirección pública.
          </Text>
        </div>
      </div>
    </div>
  );
}
