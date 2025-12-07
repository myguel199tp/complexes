import {
  InputField,
  TextAreaField,
  Text,
  Button,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRef, useState } from "react";
import { IoClose, IoImages } from "react-icons/io5";
import Image from "next/image";

interface Props {
  sellerId: string;
}

export default function FormProduct({ sellerId }: Props) {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({ sellerId });

  const [files, setFiles] = useState<File[]>([]);

  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const newFiles = [...files, ...selectedFiles];
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles(newFiles);
      setPreviews(newPreviews);
      setValue("files", newFiles, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-2 gap-2 bg-white shadow-lg rounded-2xl "
    >
      <section className="flex flex-col md:!flex-row gap-4">
        <div className="w-full md:!w-[50%]">
          <div>
            <InputField
              className="mt-2"
              {...register("name")}
              placeholder="nombre del producto"
              regexType="alphanumeric"
              helpText="nombre del producto"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>

          <div className="mt-2 bg-gray-200">
            <TextAreaField
              {...register("description")}
              placeholder="Descripción"
            />
          </div>

          <div>
            <InputField
              className="mt-2"
              {...register("price")}
              placeholder="Precio"
              regexType="number"
              helpText="Precio"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>

          <div>
            <InputField
              className="mt-2"
              {...register("status")}
              placeholder="Estados del producto"
              regexType="letters"
              helpText="Estados del producto"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>

          <div>
            <InputField
              className="mt-2"
              {...register("category")}
              placeholder="Categoria del producto"
              regexType="alphanumeric"
              helpText="Categoria del producto"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>
        </div>

        {/* FILES */}
        <div className="w-full md:!w-[50%] pr-2 mt-2">
          {previews.length === 0 ? (
            <>
              <hr className="my-4" />
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
              />
              <div className="flex justify-center items-center">
                <Text size="sm">solo archivos png - jpg</Text>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <>
              <div className="max-h-[550px] overflow-y-auto space-y-4 pr-2 mt-2">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group w-full rounded-md overflow-hidden border border-gray-300"
                  >
                    {/* Número de imagen */}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
                      {index + 1}
                    </span>

                    {/* Botón eliminar */}
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
                      className="w-full h-auto rounded-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Controles inferiores */}
              <div className="flex mt-3 gap-4 items-center">
                <IoImages
                  size={50}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200"
                />
                <Text
                  size="sm"
                  className={`${
                    previews.length > 10 ? "text-red-500" : "text-gray-200"
                  }`}
                >
                  {`Has subido ${previews.length} ${
                    previews.length === 1 ? "imagen" : "imágenes"
                  } (máx. 10)`}
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <Button
        colVariant="warning"
        size="full"
        rounded="md"
        type="submit"
        className="mt-4"
      >
        Adicionar Producto
      </Button>
    </form>
  );
}
