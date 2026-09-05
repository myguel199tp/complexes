"use client";

import {
  InputField,
  TextAreaField,
  Text,
  Button,
} from "complexes-next-components";
import { useRef, useState } from "react";
import { IoClose, IoImages } from "react-icons/io5";
import Image from "next/image";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import useForm from "./use-form";

interface Props {
  sellerId: string;
}

/**
 * Alta de un servicio del catálogo.
 *
 * Se separa del formulario de productos porque lo que hay que preguntar es
 * distinto: aquí no hay stock ni estado del artículo, hay duración y reglas de
 * agenda. Mezclarlo con el de productos obligaría a esconder la mitad de los
 * campos según el tipo, que es peor de mantener y de entender.
 */
export default function FormService({ sellerId }: Props) {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isLoading,
  } = useForm({ sellerId });

  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleIconClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);

    if (!picked.length) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    const validFiles = picked.filter((file) =>
      allowedTypes.includes(file.type),
    );

    if (validFiles.length !== picked.length) {
      showAlert("Solo se permiten archivos PNG o JPG", "error");
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setFiles(validFiles);
    setValue("files", validFiles, { shouldValidate: true });
    setPreviews(validFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);

    setFiles(updatedFiles);
    setPreviews(previews.filter((_, i) => i !== index));
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-3 gap-2 bg-white shadow-lg rounded-2xl"
    >
      <section className="flex flex-col md:!flex-row gap-4">
        <div className="w-full md:!w-[50%] space-y-2">
          <InputField
            regexType="safeChars"
            {...register("name")}
            placeholder="Nombre del servicio"
            helpText="Nombre del servicio"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <TextAreaField
            {...register("description")}
            placeholder="¿Qué incluye el servicio?"
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <InputField
            {...register("price")}
            placeholder="Precio"
            regexType="number"
            helpText="Precio"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />

          <InputField
            {...register("category")}
            placeholder="Categoría"
            regexType="alphanumeric"
            helpText="Categoría"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            hasError={!!errors.category}
            errorMessage={errors.category?.message}
          />

          {/* Reglas de agenda: lo que hace que un servicio sea agendable. */}
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 space-y-2">
            <Text size="xs" font="bold" className="text-cyan-800">
              Cómo se agenda
            </Text>

            <Text size="xs" className="text-cyan-700/80">
              Con estos datos y el horario de tu negocio calculamos las franjas
              que verán tus vecinos.
            </Text>

            <InputField
              {...register("durationMinutes")}
              placeholder="60"
              regexType="number"
              helpText="Duración en minutos"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.durationMinutes}
              errorMessage={errors.durationMinutes?.message}
            />

            <InputField
              {...register("minNoticeHours")}
              placeholder="2"
              regexType="number"
              helpText="Antelación mínima (horas)"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.minNoticeHours}
              errorMessage={errors.minNoticeHours?.message}
            />

            <InputField
              {...register("maxDaysAhead")}
              placeholder="30"
              regexType="number"
              helpText="Se puede agendar hasta (días)"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.maxDaysAhead}
              errorMessage={errors.maxDaysAhead?.message}
            />
          </div>
        </div>

        <div className="w-full md:!w-[50%] pr-2 mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 transition hover:border-cyan-500">
          {previews.length === 0 ? (
            <>
              <hr className="my-4" />
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-400 hover:text-cyan-600 transition w-24 h-24 sm:w-48 sm:h-48 md:w-60 md:h-60 mx-auto"
              />
              <div className="flex justify-center items-center pb-4">
                <Text size="sm">solo archivos png - jpg (máx. 3)</Text>
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              {errors.files && (
                <div className="flex justify-center pb-4">
                  <Text size="sm" className="text-red-500">
                    {errors.files.message}
                  </Text>
                </div>
              )}
            </>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-4 p-2">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="relative group w-full rounded-md overflow-hidden border border-gray-300"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                  >
                    <IoClose size={14} />
                  </button>

                  <Image
                    src={src}
                    width={900}
                    height={350}
                    alt={`Vista previa ${index}`}
                    className="w-full h-auto rounded-md"
                  />
                </div>
              ))}

              <IoImages
                size={48}
                onClick={handleIconClick}
                className="cursor-pointer text-gray-400 hover:text-cyan-700"
              />

              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      </section>

      <Button
        colVariant="success"
        size="full"
        rounded="md"
        type="submit"
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? "Publicando..." : "Adicionar Servicio"}
      </Button>
    </form>
  );
}
