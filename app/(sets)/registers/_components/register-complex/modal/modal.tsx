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
      onError: () => {
        // el error se muestra abajo
      },
    });
  };
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div key={language} className="p-4">
        {step === "initial" && (
          <div className="flex flex-col items-center justify-center gap-4">
            <Avatar
              src="/complex.jpg"
              alt="complex"
              size="lg"
              border="none"
              shape="rounded"
            />
            <Text
              tKey={t("conjuntoregistrado")}
              translate="yes"
              className="text-center"
            />
            <div className="flex justify-center gap-4">
              <Buton
                colVariant="warning"
                size="md"
                borderWidth="none"
                translate="yes"
                tKey={t("continueRegistro")}
                onClick={handleAlreadyRegistered}
              >
                Continuar registro
              </Buton>
              <Buton
                tKey={t("primerVez")}
                translate="yes"
                colVariant="success"
                size="md"
                borderWidth="none"
                onClick={handleNotRegistered}
              >
                No, primer vez
              </Buton>
            </div>
          </div>
        )}

        {step === "code" && (
          <div className="flex flex-col justify-center items-center gap-4">
            <Avatar
              src="/complex.jpg"
              alt="complex"
              size="lg"
              border="none"
              shape="rounded"
            />
            <Text tKey={t("documentocontinua")} className="text-center" />

            <InputField
              sizeHelp="sm"
              placeholder="NIT, RUT, CUIT, RFC, CNPJ, RUC, EIN , IRS"
              helpText={t("identficacion")}
              value={nit}
              onChange={(e) => setNit(e.target.value)}
            />

            {isLoading && (
              <ImSpinner9 className="animate-spin text-base mr-2" />
            )}

            {isError && (
              <Text size="xs">
                {error?.message || "No se encontró el conjunto"}
              </Text>
            )}

            <div className="flex justify-center gap-2">
              <Buton
                onClick={handleModalClose}
                rounded="lg"
                borderWidth="none"
                colVariant="default"
                size="md"
                tKey={t("cancelar")}
              >
                Cancelar
              </Buton>
              <Buton
                onClick={handleCodeSubmit}
                colVariant="warning"
                borderWidth="none"
                rounded="lg"
                size="md"
                tKey={t("confirmar")}
                disabled={isLoading}
              >
                Confirmar
              </Buton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
