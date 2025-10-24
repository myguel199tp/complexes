"use client";
import {
  Button,
  InputField,
  MultiSelect,
  SelectField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import RegisterOptions from "./regsiter-options";
import { IoClose, IoImages } from "react-icons/io5";
import Image from "next/image";
import useForm from "./use-form";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { Controller } from "react-hook-form";

export default function Form() {
  const {
    antiquitygOptions,
    parkingOptions,
    roomOptions,
    restroomOptions,
    ofertOptions,
    propertyOptions,
    anemitieUnityOptions,
    amenitiesOptions,
  } = RegisterOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const [kindImmovable, setkindImmovable] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useForm();

  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();

  const handleIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
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
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <section className="flex flex-col gap-4 md:!flex-row justify-between">
          {/* Columna izquierda */}
          <div className="w-full md:!w-[30%]">
            <div className="mt-2">
              <SelectField
                defaultOption="Tipo de oferta"
                helpText="Tipo de oferta"
                sizeHelp="xs"
                id="ofert"
                options={ofertOptions}
                inputSize="md"
                rounded="lg"
                {...register("ofert")}
                hasError={!!errors.ofert}
                errorMessage={errors.ofert?.message}
              />
            </div>

            <InputField type="hidden" {...register("conjunto_id")} />

            <div className="mt-2">
              <SelectField
                defaultOption="Tipo de inmueble"
                helpText="Tipo de inmueble"
                sizeHelp="xs"
                id="property"
                options={propertyOptions}
                inputSize="md"
                rounded="lg"
                {...register("property")}
                hasError={!!errors.property}
                errorMessage={errors.property?.message}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setkindImmovable(selectedValue);
                  setValue("property", selectedValue, { shouldValidate: true });
                }}
              />
            </div>
            {(!kindImmovable ||
              [2, 5, 7, 8].includes(Number(kindImmovable))) && (
              <div className="mt-2">
                <SelectField
                  defaultOption="# de habitaciones"
                  helpText="# de habitaciones"
                  sizeHelp="xs"
                  id="room"
                  options={roomOptions}
                  inputSize="md"
                  rounded="lg"
                  {...register("room")}
                  hasError={!!errors.room}
                  errorMessage={errors.room?.message}
                />
              </div>
            )}

            {(!kindImmovable ||
              [1, 2, 4, 5, 6, 7, 8].includes(Number(kindImmovable))) && (
              <div className="mt-2">
                <SelectField
                  defaultOption="# de baños"
                  helpText="# de baños"
                  sizeHelp="xs"
                  id="restroom"
                  options={restroomOptions}
                  inputSize="md"
                  rounded="lg"
                  {...register("restroom")}
                  hasError={!!errors.restroom}
                  errorMessage={errors.restroom?.message}
                />
              </div>
            )}

            {(!kindImmovable ||
              [1, 2, 4, 5, 6, 7, 8].includes(Number(kindImmovable))) && (
              <div className="mt-2">
                <SelectField
                  defaultOption="Antiguedad inmueble"
                  helpText="Antiguedad inmueble"
                  sizeHelp="xs"
                  id="age"
                  options={antiquitygOptions}
                  inputSize="md"
                  rounded="lg"
                  {...register("age")}
                  hasError={!!errors.age}
                  errorMessage={errors.age?.message}
                />
              </div>
            )}

            <div className="mt-2">
              <SelectField
                defaultOption="# de parqueaderos"
                helpText="# de parqueaderos"
                sizeHelp="xs"
                id="parking"
                options={parkingOptions}
                inputSize="md"
                rounded="lg"
                {...register("parking")}
                hasError={!!errors.parking}
                errorMessage={errors.parking?.message}
              />
            </div>

            <InputField
              placeholder="Precio"
              helpText="Precio"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="price"
              type="text"
              className="mt-2"
              {...register("price")}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                const input = e.currentTarget;
                input.value = input.value.replace(/[^0-9]/g, ""); // solo números
              }}
              hasError={!!errors.price}
              errorMessage={errors.price?.message}
            />

            <InputField
              placeholder="Valor Administración"
              helpText="Valor Administración"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="administration"
              type="text"
              className="mt-2"
              {...register("administration")}
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                const input = e.currentTarget;
                input.value = input.value.replace(/[^0-9]/g, ""); // solo números
              }}
              hasError={!!errors.administration}
              errorMessage={errors.administration?.message}
            />
            <div className="mt-2">
              <Controller
                name="amenitiesResident"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    id="amenitiesResident"
                    searchable
                    defaultOption="Amenidades Unidad residencial"
                    helpText="Amenidades Unidad residencial"
                    sizeHelp="xs"
                    options={anemitieUnityOptions}
                    inputSize="md"
                    rounded="lg"
                    disabled={false}
                    onChange={field.onChange}
                    hasError={!!errors.amenitiesResident}
                    errorMessage={errors.amenitiesResident?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Columna central */}
          <div className="w-full md:!w-[40%] border-x-4  p-1">
            {previews.length === 0 ? (
              <>
                <IoImages
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200 w-10 h-10 sm:w-28 sm:h-28 md:w-72 md:h-28 lg:w-[150px] lg:h-[150px]"
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
                <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 mt-2">
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

          {/* Columna derecha */}
          <div className="w-full md:!w-[30%]">
            <div className="mt-2">
              <SelectField
                searchable
                defaultOption="Pais"
                helpText="Pais"
                sizeHelp="xs"
                id="country"
                options={countryOptions}
                inputSize="md"
                rounded="lg"
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, { shouldValidate: true });
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />
            </div>
            <div className="mt-2">
              <SelectField
                searchable
                defaultOption="Ciudad"
                helpText="Ciudad"
                sizeHelp="xs"
                id="city"
                options={cityOptions}
                inputSize="md"
                rounded="lg"
                {...register("city")}
                onChange={(e) => {
                  setValue("city", e.target?.value || "", {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />
            </div>

            <InputField
              placeholder="Barrio"
              helpText="Barrio"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="neighborhood"
              type="text"
              className="mt-2"
              {...register("neighborhood")}
              hasError={!!errors.neighborhood}
              errorMessage={errors.neighborhood?.message}
            />

            <InputField
              placeholder="Dirección"
              helpText="Dirección"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="address"
              type="text"
              className="mt-2"
              {...register("address")}
              hasError={!!errors.address}
              errorMessage={errors.address?.message}
            />

            <InputField
              placeholder="Área construida"
              helpText="Área construida"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="area"
              type="text"
              className="mt-2"
              {...register("area")}
              hasError={!!errors.area}
              errorMessage={errors.area?.message}
            />

            <InputField
              placeholder="Whatsapp"
              helpText="Whatsapp"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="phone"
              type="text"
              className="mt-2"
              {...register("phone")}
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
            />

            <InputField
              placeholder="Correo electronico"
              helpText="Correo electronico"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="email"
              type="text"
              className="mt-2"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
            />
            <div className="mt-2">
              <Controller
                name="amenities"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    id="amenities"
                    searchable
                    defaultOption="Amenidades"
                    helpText="Amenidades"
                    sizeHelp="xs"
                    options={amenitiesOptions}
                    inputSize="md"
                    rounded="lg"
                    disabled={false}
                    onChange={field.onChange}
                    hasError={!!errors.amenities}
                    errorMessage={errors.amenities?.message}
                  />
                )}
              />
            </div>
          </div>
        </section>
        <TextAreaField
          {...register("description")}
          className="bg-gray-200 w-full mt-2 p-4 rounded-md"
          placeholder="Descripción"
        />

        <Button
          colVariant="warning"
          disabled={previews.length > 10}
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
        >
          Agregar Inmueble
        </Button>
      </form>
    </div>
  );
}
