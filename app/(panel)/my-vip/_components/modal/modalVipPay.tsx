import React, { useMemo, useRef, useState } from "react";
import {
  InputField,
  Modal,
  SelectField,
  Text,
  Button,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { IoDocumentAttach } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useHasBankAccount } from "@/app/(panel)/my-fees/_components/useHasBankAccount";
import { ConjuntoBankAccount } from "@/app/(panel)/my-fees/services/bankUnitService";
import {
  AdminFeeResponse,
  feeStatusLabel,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import { useUploadFeePaymentMutation } from "../use-upload-payment-mutation";

type Tab = "cuotas" | "multas";

const FINE_TYPE = "Multas o sanciones económicas";

/** Lo que el residente puede fotografiar o adjuntar como soporte. */
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

const MAX_FILE_SIZE = 8 * 1024 * 1024;

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
}

const currency = (value: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ModalVipPay({ isOpen, onClose, fees, fines }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: bank = [] } = useHasBankAccount();

  const [activeTab, setActiveTab] = useState<Tab>("cuotas");
  const [selectedId, setSelectedId] = useState<string>("");
  const [valuepay, setValuepay] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedId("");
    setValuepay("");
    setFile(null);
    setPreview(null);
    setFormError(null);
  };

  const upload = useUploadFeePaymentMutation(() => {
    resetForm();
    onClose();
  });

  // Las multas son cuotas con un tipo particular; se separan solo para la vista.
  const payableFees = useMemo(
    () => fees.filter((fee) => fee.type !== FINE_TYPE),
    [fees],
  );

  const currentList = activeTab === "cuotas" ? payableFees : fines;

  const selected = useMemo(
    () => currentList.find((fee) => fee.id === selectedId) ?? null,
    [currentList, selectedId],
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setFormError(null);

    const fee = currentList.find((f) => f.id === id);
    // El valor a pagar se propone igual al de la cuota; el residente puede
    // ajustarlo si abonó una cantidad distinta.
    setValuepay(fee ? String(fee.amount) : "");
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

    if (!selected) {
      setFormError("Selecciona la cuota que estás pagando.");
      return;
    }

    if (!file) {
      setFormError("Adjunta el comprobante de pago.");
      return;
    }

    upload.mutate({ feeId: selected.id, file, valuepay });
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const isPdf = file?.type === "application/pdf";

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
              <div className="flex gap-2 border-b pb-2">
                <button
                  type="button"
                  onClick={() => switchTab("cuotas")}
                  className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                    activeTab === "cuotas"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
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
                  className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                    activeTab === "multas"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Multas / Sanciones
                  {fines.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {fines.length}
                    </span>
                  )}
                </button>
              </div>

              {currentList.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Text size="sm" className="text-green-700">
                    🟢{" "}
                    {activeTab === "cuotas"
                      ? "No tienes cuotas por pagar"
                      : "No tienes multas o sanciones pendientes"}
                  </Text>
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
                    <div className="flex gap-6">
                      <div className="w-1/2 bg-white border rounded-xl p-4 shadow-sm space-y-2">
                        <Text size="sm">
                          <b>Concepto:</b> {selected.customName ?? selected.type}
                        </Text>
                        <Text size="sm">
                          <b>Monto:</b> {currency(selected.amount)}
                        </Text>
                        <Text size="sm">
                          <b>Vence:</b>{" "}
                          {new Date(selected.dueDate).toLocaleDateString(
                            "es-CO",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
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

                      <div className="w-px bg-gray-300" />

                      <div className="w-1/2 max-h-[200px] overflow-y-auto pr-2">
                        {bank.length === 0 ? (
                          <Text size="sm">No hay cuentas bancarias</Text>
                        ) : (
                          (bank as ConjuntoBankAccount[]).map((b) => (
                            <div
                              key={b.id}
                              className="mb-4 text-sm text-gray-700"
                            >
                              <Text size="sm">
                                <b>Banco:</b> {b.bankName}
                              </Text>
                              <Text size="sm">
                                <b>Número:</b> {b.accountNumber}
                              </Text>
                              <Text size="sm">
                                <b>Tipo:</b> {b.accountType}
                              </Text>
                              {b.isPrimary && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Principal
                                </span>
                              )}
                              <hr className="mt-3" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <InputField
                placeholder={t("valorPagar")}
                helpText={t("valorPagar")}
                inputSize="sm"
                regexType="number"
                type="text"
                value={valuepay}
                onChange={(e) => setValuepay(e.target.value)}
              />

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
                <Button
                  colVariant="success"
                  size="sm"
                  type="submit"
                  disabled={upload.isPending || !selected || !file}
                >
                  {upload.isPending ? "Enviando..." : "Enviar comprobante"}
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
