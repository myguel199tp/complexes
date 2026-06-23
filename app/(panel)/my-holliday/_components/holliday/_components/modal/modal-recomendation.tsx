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
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("description")}
            />

            <InputField
              placeholder="Tipo de lugar"
              helpText="Tipo de lugar"
              sizeHelp="xs"
              className="mt-2"
              {...register("type")}
            />

            <InputField
              placeholder="Distancia hasta el lugar"
              helpText="Distancia hasta el lugar"
              sizeHelp="xs"
              className="mt-2"
              {...register("distance")}
            />
          </div>

          <div className="w-full">
            <InputField
              placeholder="Cómo llegar"
              helpText="Cómo llegar"
              sizeHelp="xs"
              className="mt-2"
              {...register("transport")}
            />

            <InputField
              placeholder="Costo estimado"
              helpText="Costo estimado"
              sizeHelp="xs"
              className="mt-2"
              {...register("estimatedCost")}
            />

            <InputField
              placeholder="Dirección del lugar"
              helpText="Dirección del lugar"
              sizeHelp="xs"
              className="mt-2"
              {...register("address")}
            />

            <TextAreaField
              placeholder="Notas"
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("notes")}
            />
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" colVariant="default" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" colVariant="success" size="sm">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
