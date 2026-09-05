"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Title,
  Text,
  InputField,
  SelectField,
} from "complexes-next-components";
import DateField from "@/app/components/ui/date-field/DateField";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bDocument,
  B2bDocumentRule,
  B2bDocumentType,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONE,
  deleteDocument,
  documentFileUrl,
  getCompliance,
  uploadDocument,
} from "../services/b2bComplianceService";

const EMPTY_FORM = {
  type: "" as B2bDocumentType | "",
  typeOther: "",
  documentNumber: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
};

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : null;

/**
 * Cómo se lee el vencimiento en la tarjeta. El umbral de 30 días es el mismo
 * con el que el backend empieza a mandar avisos: si la pantalla dijera "todo
 * bien" el día que llega el primer correo, uno de los dos estaría mintiendo.
 */
function expiryTone(doc: B2bDocument): string {
  if (doc.expired) return "text-red-400";
  if (doc.daysToExpiry != null && doc.daysToExpiry <= 30) {
    return "text-amber-300";
  }
  return "text-slate-500";
}

function expiryLabel(doc: B2bDocument): string | null {
  if (doc.expiresAt == null) return "No vence";
  if (doc.expired) return `Vencido el ${fmtDate(doc.expiresAt)}`;
  return `Vence el ${fmtDate(doc.expiresAt)} (${doc.daysToExpiry} días)`;
}

export default function ComercioB2bCompliancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  useComercioGuard(() => router.push("/comercio/login"));

  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["comercio_b2b_compliance"],
    queryFn: getCompliance,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_compliance"] });

  const uploadMut = useMutation({
    mutationFn: () =>
      uploadDocument({
        type: form.type as B2bDocumentType,
        typeOther: form.typeOther || undefined,
        documentNumber: form.documentNumber || undefined,
        issuer: form.issuer || undefined,
        issuedAt: form.issuedAt || undefined,
        expiresAt: form.expiresAt || undefined,
        file: file as File,
      }),
    onSuccess: () => {
      showAlert(
        "Documento recibido. Queda en revisión: te avisamos al validarlo.",
        "success",
      );
      setForm(EMPTY_FORM);
      setFile(null);
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      showAlert("Documento eliminado", "success");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const rules = data?.rules ?? [];
  const selectedRule: B2bDocumentRule | undefined = rules.find(
    (r) => r.type === form.type,
  );
  const status = data?.status;
  const labelOf = (type: B2bDocumentType) =>
    rules.find((r) => r.type === type)?.label ?? type;

  // El backend exige la fecha justo en los tipos que vencen. Reflejarlo aquí
  // evita el viaje de ida y vuelta para descubrirlo.
  const missingExpiry = !!selectedRule?.expires && !form.expiresAt;

  const canSubmit =
    !!form.type &&
    !!file &&
    !missingExpiry &&
    (form.type !== "otro" || !!form.typeOther.trim());

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Documentos y cumplimiento
          </Title>
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver
          </Link>
        </div>

        <Text size="sm" className="text-slate-400 mt-2">
          Los conjuntos responden solidariamente por sus proveedores, así que
          antes de contratarte miran que estés al día. Sube tus soportes: los
          revisamos y quedas marcado como proveedor verificado.
        </Text>

        {/* Estado de verificación. Lo primero, porque es la única línea que el
            proveedor necesita leer si todo está bien. */}
        {status ? (
          <div
            className={`mt-4 rounded-2xl border p-4 ${
              status.verified
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            <Text
              size="sm"
              font="semi"
              className={status.verified ? "text-emerald-300" : "text-amber-300"}
            >
              {status.verified
                ? "✓ Eres proveedor verificado"
                : "Aún no eres proveedor verificado"}
            </Text>

            {status.missing.length > 0 ? (
              <Text size="xs" className="text-slate-300 mt-1">
                Te falta al día:{" "}
                {status.missing.map((t) => labelOf(t)).join(", ")}.
              </Text>
            ) : null}

            {status.expiringSoon.length > 0 ? (
              <Text size="xs" className="text-amber-200 mt-1">
                Por vencer:{" "}
                {status.expiringSoon
                  .map(
                    (d) =>
                      `${labelOf(d.type)} en ${d.days} día${d.days === 1 ? "" : "s"}`,
                  )
                  .join(", ")}
                .
              </Text>
            ) : null}

            {status.pendingReview > 0 ? (
              <Text size="xs" className="text-slate-400 mt-1">
                {status.pendingReview} documento
                {status.pendingReview === 1 ? "" : "s"} en revisión. No cuentan
                para el sello hasta que los validemos.
              </Text>
            ) : null}
          </div>
        ) : null}

        {/* Formulario de carga */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid gap-3">
          <Text size="sm" font="semi" className="text-slate-200">
            Subir un soporte
          </Text>

          <SelectField
            helpText="¿Qué documento vas a subir?"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            defaultOption="¿Qué documento vas a subir?"
            options={rules.map((r) => ({
              value: r.type,
              label: `${r.label}${
                r.requiredForVerification ? " (obligatorio)" : ""
              }`,
            }))}
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value as B2bDocumentType,
                // La fecha se limpia al cambiar de tipo: la del documento
                // anterior no tiene nada que ver con el nuevo.
                expiresAt: "",
              })
            }
          />

          {selectedRule ? (
            <Text size="xs" className="text-slate-500">
              {selectedRule.hint}
            </Text>
          ) : null}

          {form.type === "otro" ? (
            <InputField
              regexType="safeChars"
              helpText="¿Qué documento es?"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              placeholder="¿Qué documento es?"
              value={form.typeOther}
              onChange={(e) => setForm({ ...form, typeOther: e.target.value })}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <InputField
              regexType="alphanumeric"
              helpText="Número (póliza, planilla...)"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              placeholder="Número (póliza, planilla...)"
              value={form.documentNumber}
              onChange={(e) =>
                setForm({ ...form, documentNumber: e.target.value })
              }
            />
            <InputField
              regexType="safeChars"
              helpText="Expedido por"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              placeholder="Expedido por"
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
            <DateField
              label="Expedición"
              value={form.issuedAt}
              onChange={(value) => setForm({ ...form, issuedAt: value })}
            />
            <DateField
              label={`Vencimiento${
                selectedRule?.expires ? " (obligatorio)" : ""
              }`}
              disabled={!!selectedRule && !selectedRule.expires}
              value={form.expiresAt}
              onChange={(value) => setForm({ ...form, expiresAt: value })}
            />
          </div>

          {missingExpiry ? (
            <Text size="xs" className="text-amber-300">
              Indica hasta cuándo vale: sin fecha no podemos avisarte antes de
              que se venza, que es de lo que se trata.
            </Text>
          ) : null}

          <input
            className="input-b2b"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <Button
            colVariant="success"
            size="sm"
            rounded="md"
            disabled={!canSubmit || uploadMut.isLoading}
            onClick={() => uploadMut.mutate()}
          >
            {uploadMut.isLoading ? "Subiendo..." : "Subir documento"}
          </Button>
        </div>

        {/* Listado */}
        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : data && data.items.length > 0 ? (
            data.items.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <Text size="sm" font="semi" className="text-slate-100">
                    {doc.label}
                    <span
                      className={`ml-2 text-xs ${DOCUMENT_STATUS_TONE[doc.status]}`}
                    >
                      {DOCUMENT_STATUS_LABELS[doc.status]}
                    </span>
                    {doc.requiredForVerification ? (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                        obligatorio
                      </span>
                    ) : null}
                  </Text>

                  <Text size="xs" className="text-slate-400">
                    {doc.fileName}
                    {doc.documentNumber ? ` · ${doc.documentNumber}` : ""}
                    {doc.issuer ? ` · ${doc.issuer}` : ""}
                  </Text>

                  <Text size="xs" className={expiryTone(doc)}>
                    {expiryLabel(doc)}
                  </Text>

                  {doc.rejectionReason ? (
                    <Text size="xs" className="text-red-300 mt-1">
                      Motivo del rechazo: {doc.rejectionReason}
                    </Text>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={documentFileUrl(doc.id)}
                    className="rounded-md border border-white/10 px-3 py-1 text-xs text-cyan-300 hover:text-cyan-200 text-center"
                  >
                    Descargar
                  </a>
                  {doc.status !== "approved" ? (
                    <Button
                      colVariant="danger"
                      size="xs"
                      rounded="md"
                      disabled={deleteMut.isLoading}
                      onClick={() => deleteMut.mutate(doc.id)}
                    >
                      Eliminar
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <Text size="sm" className="text-slate-400">
              Aún no has subido documentos. Empieza por los obligatorios.
            </Text>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-b2b {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
