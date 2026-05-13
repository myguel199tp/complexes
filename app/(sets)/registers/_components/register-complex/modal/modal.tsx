import {
  Modal,
  Text,
  InputField,
  Avatar,
  Buton,
} from "complexes-next-components";
import React, { useState } from "react";
import { useMutationByNit } from "./use-nit-mutation";
import { ImSpinner9 } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalRegisterComplex({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<"initial" | "code">("initial");
  const [nit, setNit] = useState("");
  const { mutate, isLoading, isError, error, reset } = useMutationByNit();

  const handleModalClose = () => {
    setStep("initial");
    setNit("");
    reset();
    onClose();
  };

  const handleAlreadyRegistered = () => {
    setStep("code");
  };

  const handleNotRegistered = () => {
    handleModalClose();
  };

  const handleCodeSubmit = () => {
    if (!nit.trim()) return;
    mutate(nit, {
      onSuccess: () => {
        handleModalClose();
      },
      onError: () => {},
    });
  };
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div
        key={language}
        className="relative overflow-hidden rounded-3xl bg-white"
      >
        {/* Glow decor */}
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-green-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 p-8">
          {step === "initial" && (
            <div className="flex flex-col items-center justify-center gap-5">
              {/* Avatar moderna */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 blur-md opacity-40 scale-110" />

                <div className="relative rounded-3xl border border-white/30 bg-white shadow-2xl p-2">
                  <Avatar
                    src="/complex.jpg"
                    alt="complex"
                    size="xl"
                    border="none"
                    shape="rounded"
                  />
                </div>
              </div>

              {/* Textos */}
              <div className="text-center space-y-2">
                <Text
                  tKey={t("conjuntoregistrado")}
                  translate="yes"
                  className="text-2xl font-bold text-gray-800"
                />

                <p className="text-sm text-gray-500 max-w-sm">
                  Continúa el registro de tu conjunto residencial o inicia uno
                  nuevo de manera rápida y segura.
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
                <Buton
                  colVariant="success"
                  size="lg"
                  borderWidth="none"
                  translate="yes"
                  tKey={t("continueRegistro")}
                  onClick={handleAlreadyRegistered}
                  className="
                rounded-2xl
                shadow-lg
                hover:scale-[1.03]
                transition-all
                duration-300
                font-semibold
              "
                >
                  Continuar registro
                </Buton>

                <Buton
                  tKey={t("primerVez")}
                  translate="yes"
                  colVariant="default"
                  size="lg"
                  borderWidth="none"
                  onClick={handleNotRegistered}
                  className="
                rounded-2xl
                border border-gray-200
                bg-gray-50
                hover:bg-gray-100
                transition-all
                duration-300
                font-semibold
              "
                >
                  No, primera vez
                </Buton>
              </div>
            </div>
          )}

          {step === "code" && (
            <div className="flex flex-col justify-center items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 blur-md opacity-40 scale-110" />

                <div className="relative rounded-3xl border border-white/30 bg-white shadow-2xl p-2">
                  <Avatar
                    src="/complex.jpg"
                    alt="complex"
                    size="xl"
                    border="none"
                    shape="rounded"
                  />
                </div>
              </div>

              {/* Texto */}
              <div className="text-center space-y-2">
                <Text
                  tKey={t("documentocontinua")}
                  className="text-2xl font-bold text-gray-800"
                />

                <p className="text-sm text-gray-500">
                  Ingresa el documento de identificación del conjunto.
                </p>
              </div>

              {/* Input container */}
              <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 p-4 shadow-inner">
                <InputField
                  sizeHelp="sm"
                  placeholder="NIT, RUT, CUIT, RFC, CNPJ..."
                  helpText={t("identficacion")}
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                />
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2">
                  <ImSpinner9 className="animate-spin text-green-600 text-base" />
                  <span className="text-sm text-green-700">
                    Validando información...
                  </span>
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text size="xs" className="text-red-600 font-medium">
                    {error?.message || "No se encontró el conjunto"}
                  </Text>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-center gap-3 w-full mt-2">
                <Buton
                  onClick={handleModalClose}
                  rounded="lg"
                  borderWidth="none"
                  colVariant="default"
                  size="lg"
                  tKey={t("cancelar")}
                  className="
                flex-1
                bg-gray-100
                hover:bg-gray-200
                transition-all
                duration-300
                font-semibold
              "
                >
                  Cancelar
                </Buton>

                <Buton
                  onClick={handleCodeSubmit}
                  colVariant="success"
                  borderWidth="none"
                  rounded="lg"
                  size="lg"
                  tKey={t("confirmar")}
                  disabled={isLoading}
                  className="
                flex-1
                shadow-lg
                hover:scale-[1.02]
                transition-all
                duration-300
                font-semibold
              "
                >
                  Confirmar
                </Buton>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
