import {
  Modal,
  Button,
  Text,
  InputField,
  Avatar,
} from "complexes-next-components";
import React, { useState } from "react";
import { useMutationByNit } from "./use-nit-mutation";
import { ImSpinner9 } from "react-icons/im";

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
            <Text className="text-center">
              ¿Ya tienes un conjunto registrado?
            </Text>
            <div className="flex justify-center gap-4">
              <Button onClick={handleAlreadyRegistered}>
                Continuar registro
              </Button>
              <Button onClick={handleNotRegistered}>No, primer vez</Button>
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
            <Text className="text-center">Ingresa el NIT de tu conjunto</Text>

            <InputField
              placeholder="NIT del conjunto"
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
              <Button onClick={handleModalClose}>Cancelar</Button>
              <Button onClick={handleCodeSubmit} disabled={isLoading}>
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
