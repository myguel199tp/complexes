import {
  Modal,
  InputField,
  TextAreaField,
  Button,
} from "complexes-next-components";
import React from "react";
import useFormRecomendation from "./use-recomendation-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

export default function ModalRecomendation({
  hollidayId,
  isOpen,
  onClose,
}: Props) {
  const { handleSubmit, register } = useFormRecomendation(hollidayId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar recomendaciones"
      className="w-full h-auto md:!w-[1000px]"
    >
      <form onSubmit={handleSubmit}>
        <section className="w-full flex gap-2">
          <div className="w-full">
            <InputField
              placeholder="Lugar"
              helpText="Lugar"
              sizeHelp="xs"
              {...register("place")}
            />

            <TextAreaField
              placeholder="Descripción del lugar"
              className="mt-1"
              {...register("description")}
            />

            <InputField
              placeholder="Tipo de lugar"
              helpText="Tipo de lugar"
              sizeHelp="xs"
              className="mt-1"
              {...register("type")}
            />

            <InputField
              placeholder="Distancia hasta el lugar"
              helpText="Distancia hasta el lugar"
              sizeHelp="xs"
              className="mt-1"
              {...register("distance")}
            />
          </div>

          <div className="w-full">
            <InputField
              placeholder="Cómo llegar"
              helpText="Cómo llegar"
              sizeHelp="xs"
              className="mt-1"
              {...register("transport")}
            />

            <InputField
              placeholder="Costo estimado"
              helpText="Costo estimado"
              sizeHelp="xs"
              className="mt-1"
              {...register("estimatedCost")}
            />

            <InputField
              placeholder="Dirección del lugar"
              helpText="Dirección del lugar"
              sizeHelp="xs"
              className="mt-1"
              {...register("address")}
            />

            <TextAreaField
              placeholder="Notas"
              className="mt-1"
              {...register("notes")}
            />
          </div>
        </section>

        <div className="mt-2">
          <Button colVariant="warning" rounded="md" size="full" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
