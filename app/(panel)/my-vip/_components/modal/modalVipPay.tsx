import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InputField,
  Modal,
  SelectField,
  TextAreaField,
  Text,
  Button,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import DateField from "@/app/components/ui/date-field/DateField";
import {
  AdminFeeResponse,
  feeStatusLabel,
  isFineFee,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import PaymentInstructions from "../payment-instructions";
import { usePayableConceptsQuery } from "../use-payable-concepts-query";
import { useSelfReportPaymentMutation } from "../use-self-report-payment-mutation";
import { useUploadFeePaymentMutation } from "../use-upload-payment-mutation";

type Tab = "cuotas" | "multas" | "otro";

/** Lo que el residente puede fotografiar o adjuntar como soporte. */
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

const MAX_FILE_SIZE = 8 * 1024 * 1024;

/**
 * Conceptos de respaldo cuando el conjunto no tiene configuración de cobro
 * creada. Son los mismos valores del enum `FeeType` del backend, sin multas ni
 * saldo inicial: esos dos solo los registra la administración.
 */
const FALLBACK_CONCEPTS = [
  "Cuota de administración",
  "Cuotas extraordinarias",
  "Pago de parqueadero",
  "Aportes al fondo de reserva",
  "Intereses por mora",
  "zonas comunes",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Cuotas del residente que todavía admiten pago.
   *
   * Antes aquí llegaban las CONFIGURACIONES de cobro del conjunto
   * (`AdminFeePayment`), no las cuotas reales, así que no había forma de saber a
   * qué deuda se estaba abonando.
   */
  fees: AdminFeeResponse[];
  fines: AdminFeeResponse[];
  /**
   * Por qué no se pudieron cargar las cuotas, si la consulta falló.
   *
   * Sin esto un error del backend se veía igual que estar al día: la lista
   * llegaba vacía y el modal celebraba "No tienes cuotas por pagar".
   */
  loadError?: string | null;
}

const currency = (value: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const today = () => new Date().toISOString().split("T")[0];

export default function ModalVipPay({
  isOpen,
  onClose,
  fees,
  fines,
  loadError,
}: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>("cuotas");
  const [selectedId, setSelectedId] = useState<string>("");
  const [valuepay, setValuepay] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Pago sin cuota previa: aquí el residente dice qué está pagando.
  const [conceptKey, setConceptKey] = useState<string>("");
  const [paidAt, setPaidAt] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: concepts = [] } = usePayableConceptsQuery(isOpen);

  const resetForm = () => {
    setSelectedId("");
    setValuepay("");
    setReference("");
    setFile(null);
    setPreview(null);
    setFormError(null);
    setConceptKey("");
    setPaidAt(today());
    setDescription("");
  };

  const upload = useUploadFeePaymentMutation(() => {
    resetForm();
    onClose();
  });

  const selfReport = useSelfReportPaymentMutation(() => {
    resetForm();
    onClose();
  });

  const isPending = upload.isPending || selfReport.isPending;

  // Las multas son cuotas con un tipo particular; se separan solo para la vista.
  const payableFees = useMemo(
    () => fees.filter((fee) => !isFineFee(fee.type)),
    [fees],
  );

  /**
   * El modal abría siempre en "Cuotas". Con la cartera al día y una multa
   * pendiente, eso dejaba al residente mirando "No tienes cuotas por pagar" y un
   * botón gris, sin nada que seleccionar: lo único que debía estaba en la otra
   * pestaña, detrás de un badge que nadie mira.
   */
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(
      payableFees.length > 0 ? "cuotas" : fines.length > 0 ? "multas" : "otro",
    );
    resetForm();
    // Solo al abrir: con el modal abierto manda la pestaña que elija el usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const currentList = activeTab === "multas" ? fines : payableFees;

  const selected = useMemo(
    () => currentList.find((fee) => fee.id === selectedId) ?? null,
    [currentList, selectedId],
  );

  const conceptOptions = useMemo(() => {
    if (concepts.length > 0) {
      return concepts.map((concept) => ({
        value: `config:${concept.id}`,
        label: concept.amount
          ? `${concept.feeType} · ${currency(concept.amount)}`
          : concept.feeType,
      }));
    }

    return FALLBACK_CONCEPTS.map((type) => ({
      value: `type:${type}`,
      label: type,
    }));
  }, [concepts]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setFormError(null);

    const fee = currentList.find((f) => f.id === id);
    // El valor a pagar se propone igual al de la cuota; el residente puede
    // ajustarlo si abonó una cantidad distinta.
    setValuepay(fee ? String(fee.amount) : "");
  };

  const handleConceptSelect = (key: string) => {
    setConceptKey(key);
    setFormError(null);

    const concept = concepts.find((c) => `config:${c.id}` === key);

    if (concept?.amount) {
      setValuepay(String(concept.amount));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];

    if (!picked) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setFormError("El comprobante debe ser un PDF o una imagen.");
      return;
    }

    if (picked.size > MAX_FILE_SIZE) {
      setFormError("El comprobante no puede pesar más de 8 MB.");
      return;
    }

    setFormError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loadError) {
      setFormError(
        "No pudimos cargar tus cuotas, así que no hay a cuál adjuntar el comprobante. Intenta de nuevo en un momento.",
      );
      return;
    }

    /**
     * Soporte: archivo o referencia. Quien paga por convenio de recaudo no
     * recibe comprobante, solo el número de la transacción, y exigirle un
     * archivo lo dejaba sin manera de reportar el pago.
     */
    const hasProof = !!file || !!reference.trim();

    if (activeTab === "otro") {
      if (!conceptKey) {
        setFormError("Elige qué estás pagando.");
        return;
      }

      const amount = Number(valuepay.replace(/[^\d.-]/g, ""));

      if (!amount || amount <= 0) {
        setFormError("Escribe el valor que pagaste.");
        return;
      }

      if (!paidAt) {
        setFormError("Indica la fecha en que pagaste.");
        return;
      }

      if (!hasProof) {
        setFormError(
          "Adjunta el comprobante o escribe la referencia de la transacción.",
        );
        return;
      }

      const [kind, value] = conceptKey.split(/:(.+)/);

      selfReport.mutate({
        paymentConfigId: kind === "config" ? value : undefined,
        type: kind === "type" ? value : undefined,
        valuepay: String(amount),
        paidAt,
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
        file,
      });

      return;
    }

    if (currentList.length === 0) {
      setFormError(
        activeTab === "cuotas"
          ? 'No tienes cuotas generadas. Si ya consignaste, usa la pestaña "Reportar otro pago".'
          : "No tienes multas o sanciones pendientes.",
      );
      return;
    }

    if (!selected) {
      setFormError("Selecciona la cuota que estás pagando.");
      return;
    }

    if (!hasProof) {
      setFormError(
        "Adjunta el comprobante o escribe la referencia de la transacción.",
      );
      return;
    }

    upload.mutate({
      feeId: selected.id,
      file,
      valuepay,
      reference: reference.trim() || undefined,
    });
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const isPdf = file?.type === "application/pdf";

  const tabClass = (tab: Tab, active: string) =>
    `px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
      activeTab === tab ? active : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <Modal
      isOpen={isOpen}
      title="Subir comprobante de pago"
      onClose={onClose}
      className="w-[95%] max-w-5xl max-h-[90vh]"
    >
      <form
        key={language}
        onSubmit={handleSubmit}
        className="overflow-y-auto max-h-[80vh]"
      >
        <div className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {/* TABS */}
              <div className="flex flex-wrap gap-2 border-b pb-2">
                <button
                  type="button"
                  onClick={() => switchTab("cuotas")}
                  className={tabClass("cuotas", "bg-blue-600 text-white")}
                >
                  Cuotas
                  {payableFees.length > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {payableFees.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("multas")}
                  className={tabClass("multas", "bg-red-600 text-white")}
                >
                  Multas / Sanciones
                  {fines.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {fines.length}
                    </span>
                  )}
                </button>

                {/*
                  La salida para el caso corriente: el residente consignó su
                  administración y la administración todavía no generó la cuota.
                */}
                <button
                  type="button"
                  onClick={() => switchTab("otro")}
                  className={tabClass("otro", "bg-emerald-600 text-white")}
                >
                  Reportar otro pago
                </button>
              </div>

              {loadError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-2">
                  <Text size="sm" colVariant="danger">
                    No pudimos cargar tus cuotas
                  </Text>

                  <Text size="xs" className="text-gray-600">
                    {loadError}
                  </Text>

                  <Text size="xs" className="text-gray-600">
                    No des el pago por perdido: vuelve a entrar en un momento o
                    avísale a la administración.
                  </Text>
                </div>
              ) : activeTab === "otro" ? (
                <div className="space-y-3">
                  <Text size="xs" className="text-gray-600">
                    Usa esta opción cuando ya pagaste y la cuota todavía no
                    aparece. La administración verifica el pago contra el
                    extracto y lo cruza con tu cartera.
                  </Text>

                  <SelectField
                    helpText="¿Qué estás pagando?"
                    defaultOption="Seleccionar concepto"
                    options={conceptOptions}
                    value={conceptKey}
                    onChange={(e) => handleConceptSelect(e.target.value)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      placeholder={t("valorPagar")}
                      helpText={t("valorPagar")}
                      inputSize="sm"
                      regexType="number"
                      type="text"
                      value={valuepay}
                      onChange={(e) => setValuepay(e.target.value)}
                    />

                    <DateField
                      label="Fecha en que pagaste"
                      value={paidAt}
                      onChange={setPaidAt}
                      /* Un pago con fecha futura no existe: el backend lo
                         rechaza y aquí ni siquiera se deja escoger. */
                      maxDate={new Date()}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Text size="sm" className="text-gray-600">
                      Descripción (opcional)
                    </Text>

                    <TextAreaField
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: administración de marzo"
                    />
                  </div>
                </div>
              ) : currentList.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col gap-2">
                  <Text size="sm" className="text-green-700">
                    🟢{" "}
                    {activeTab === "cuotas"
                      ? "No tienes cuotas por pagar"
                      : "No tienes multas o sanciones pendientes"}
                  </Text>

                  <Text size="xs" className="text-gray-600">
                    {activeTab === "cuotas"
                      ? 'Si ya consignaste y la cuota no aparece, repórtalo desde "Reportar otro pago".'
                      : "Aquí aparecen las sanciones que te imponga la administración."}
                  </Text>

                  {activeTab === "cuotas" && fines.length > 0 && (
                    <Text size="xs" colVariant="danger">
                      Tienes {fines.length} multa{fines.length > 1 ? "s" : ""} o
                      sanción pendiente en la pestaña Multas / Sanciones.
                    </Text>
                  )}
                </div>
              ) : (
                <>
                  <SelectField
                    helpText={
                      activeTab === "cuotas"
                        ? "Cuota a pagar"
                        : "Multa o sanción a pagar"
                    }
                    defaultOption="Seleccionar"
                    options={currentList.map((fee) => ({
                      value: fee.id,
                      label: `${fee.customName ?? fee.type} · ${currency(
                        fee.amount,
                      )} · vence ${new Date(fee.dueDate).toLocaleDateString(
                        "es-CO",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}`,
                    }))}
                    value={selectedId}
                    onChange={(e) => handleSelect(e.target.value)}
                  />

                  {selected && (
                    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                      <Text size="sm">
                        <b>Concepto:</b> {selected.customName ?? selected.type}
                      </Text>
                      <Text size="sm">
                        <b>Monto:</b> {currency(selected.amount)}
                      </Text>
                      <Text size="sm">
                        <b>Vence:</b>{" "}
                        {new Date(selected.dueDate).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Text size="sm">
                        <b>Estado:</b> {feeStatusLabel(selected.status)}
                      </Text>

                      {selected.rejectionReason && (
                        <Text size="sm" colVariant="danger">
                          <b>Motivo del rechazo anterior:</b>{" "}
                          {selected.rejectionReason}
                        </Text>
                      )}
                    </div>
                  )}

                  {/*
                    El valor solo tiene sentido contra una cuota concreta: suelto
                    invitaba a escribir un monto y esperar que algo pasara.
                  */}
                  {selected && (
                    <InputField
                      placeholder={t("valorPagar")}
                      helpText={t("valorPagar")}
                      inputSize="sm"
                      regexType="number"
                      type="text"
                      value={valuepay}
                      onChange={(e) => setValuepay(e.target.value)}
                    />
                  )}
                </>
              )}

              {/*
                Referencia de la transacción: con convenio de recaudo el banco
                no entrega comprobante, solo este número.
              */}
              {!loadError && (
                <InputField
                  placeholder="Referencia de la transacción (opcional)"
                  helpText="Referencia de la transacción"
                  inputSize="sm"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              )}

              {/*
                Dónde pagar: convenios de recaudo, pago en línea y cuentas del
                conjunto. Antes la lista de cuentas solo aparecía después de
                elegir una cuota, así que quien no tenía cuotas generadas ni
                siquiera veía a dónde consignar.
              */}
              <PaymentInstructions />

              {formError && (
                <Text size="sm" colVariant="danger">
                  {formError}
                </Text>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button
                  type="button"
                  colVariant="default"
                  size="sm"
                  onClick={onClose}
                >
                  Cancelar
                </Button>

                {/*
                  Solo se bloquea mientras se envía. Deshabilitarlo por falta de
                  cuota o de archivo era un callejón sin salida: el submit no
                  corría y el motivo nunca se mostraba.
                */}
                <Button
                  colVariant="success"
                  size="sm"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending
                    ? "Enviando..."
                    : activeTab === "otro"
                      ? "Reportar pago"
                      : "Enviar comprobante"}
                </Button>
              </div>
            </div>

            {/* COMPROBANTE */}
            <div className="space-y-4">
              <Text size="sm" className="text-gray-600">
                {t("adjuntarArchivo")}
              </Text>

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer transition hover:border-cyan-500 p-6"
                >
                  <IoDocumentAttach
                    size={96}
                    className="cursor-pointer text-gray-400 hover:text-cyan-600 transition mb-3"
                  />

                  <Text size="sm" className="text-gray-600 text-center">
                    Adjunta la foto o el PDF de tu consignación
                  </Text>

                  <Text size="xs" className="text-gray-400 mt-1">
                    PDF, JPG, PNG o WEBP • Máx 8 MB
                  </Text>

                  <Text size="xs" className="text-gray-400 mt-1 text-center">
                    Si pagaste por convenio, basta con la referencia.
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {isPdf ? (
                    <iframe
                      src={preview}
                      className="w-full h-[300px] rounded-xl border shadow-sm"
                      title="Previsualización del comprobante"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Comprobante de pago"
                      className="w-full h-[300px] object-contain rounded-xl border shadow-sm bg-white"
                    />
                  )}

                  <Button
                    type="button"
                    colVariant="success"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("cambiarArchivo")}
                  </Button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
