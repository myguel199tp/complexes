import {
  Modal,
  Button,
  Text,
  InputField,
  Avatar,
  Buton,
} from "complexes-next-components";
import React, { useState } from "react";
import { useMutationByNit } from "./use-nit-mutation";
import { ImSpinner9 } from "react-icons/im";
import { useTranslation } from "react-i18next";

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
  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <div className="p-4">
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
            >
              ¿Ya tienes un conjunto residencial registrado?
            </Text>
            <div className="flex justify-center gap-4">
              <Button
                tKey={t("continuar")}
                translate="yes"
                onClick={handleAlreadyRegistered}
              >
                Continuar registro
              </Button>
              <Button
                tKey={t("primerVez")}
                translate="yes"
                onClick={handleNotRegistered}
              >
                No, primer vez
              </Button>
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
            <Text tKey={t("documentocontinua")} className="text-center">
              Ingresa numero de documento de identificación de unidad
              residencial
            </Text>

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
                colVariant="default"
                size="full"
                tKey={t("cancelar")}
              >
                Cancelar
              </Buton>
              <Buton
                onClick={handleCodeSubmit}
                colVariant="warning"
                rounded="lg"
                size="full"
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
