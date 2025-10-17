"use client";
import {
  Button,
  InputField,
  MultiSelect,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import RegisterOptions from "./regsiter-options";
import { IoImages } from "react-icons/io5";
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
  } = RegisterOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

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
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setValue("files", files, { shouldValidate: true });
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
    } else {
      setPreviews([]);
    }
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
                sizeHelp="sm"
                id="ofert"
                options={ofertOptions}
                inputSize="lg"
                rounded="md"
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
                sizeHelp="sm"
                id="property"
                options={propertyOptions}
                inputSize="lg"
                rounded="md"
                {...register("property")}
                hasError={!!errors.property}
                errorMessage={errors.property?.message}
              />
            </div>

            <div className="mt-2">
              <SelectField
                defaultOption="# de habitaciones"
                helpText="# de habitaciones"
                sizeHelp="sm"
                id="room"
                options={roomOptions}
                inputSize="lg"
                rounded="md"
                {...register("room")}
                hasError={!!errors.room}
                errorMessage={errors.room?.message}
              />
            </div>

            <div className="mt-2">
              <SelectField
                defaultOption="# de baños"
                helpText="# de baños"
                sizeHelp="sm"
                id="restroom"
                options={restroomOptions}
                inputSize="lg"
                rounded="md"
                {...register("restroom")}
                hasError={!!errors.restroom}
                errorMessage={errors.restroom?.message}
              />
            </div>

            <div className="mt-2">
              <SelectField
                defaultOption="Antiguedad inmueble"
                helpText="Antiguedad inmueble"
                sizeHelp="sm"
                id="age"
                options={antiquitygOptions}
                inputSize="lg"
                rounded="md"
                {...register("age")}
                hasError={!!errors.age}
                errorMessage={errors.age?.message}
              />
            </div>

            <div className="mt-2">
              <SelectField
                defaultOption="# de parqueaderos"
                helpText="# de parqueaderos"
                sizeHelp="sm"
                id="parking"
                options={parkingOptions}
                inputSize="lg"
                rounded="md"
                {...register("parking")}
                hasError={!!errors.parking}
                errorMessage={errors.parking?.message}
              />
            </div>

            <InputField
              placeholder="Precio"
              helpText="Precio"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              id="price"
              type="text"
              className="mt-2"
              {...register("price")}
              hasError={!!errors.price}
              errorMessage={errors.price?.message}
            />

            <InputField
              placeholder="Valor"
              helpText="Valor"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              id="administration"
              type="text"
              className="mt-2"
              {...register("administration")}
              hasError={!!errors.administration}
              errorMessage={errors.administration?.message}
            />
          </div>

          {/* Columna central */}
          <div className="w-full md:!w-[40%] border-x-4  p-1">
            {previews.length === 0 ? (
              <>
                <IoImages
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-72 md:h-72 lg:w-[550px] lg:h-[550px]"
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
                <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2 mt-2">
                  {previews.map((src, index) => (
                    <div
                      key={index}
                      className="group w-full rounded-md  overflow-hidden"
                    >
                      <Image
                        src={src}
                        width={900}
                        height={350}
                        alt={`Vista previa ${index}`}
                        className="w-full h-auto rounded-md border transition-transform duration-300 group-hover:scale-125"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex mt-2 gap-4">
                  <IoImages
                    size={50}
                    onClick={handleIconClick}
                    className="cursor-pointer text-gray-200"
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
                sizeHelp="sm"
                id="country"
                options={countryOptions}
                inputSize="lg"
                rounded="md"
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
                sizeHelp="sm"
                id="city"
                options={cityOptions}
                inputSize="lg"
                rounded="md"
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
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
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
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
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
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              id="area"
              type="text"
              className="mt-2"
              {...register("area")}
              hasError={!!errors.area}
              errorMessage={errors.area?.message}
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
                    sizeHelp="sm"
                    options={anemitieUnityOptions}
                    inputSize="lg"
                    rounded="md"
                    disabled={false}
                    onChange={field.onChange} // RHF recibe el array string[]
                    hasError={!!errors.amenitiesResident}
                    errorMessage={errors.amenitiesResident?.message}
                  />
                )}
              />
            </div>

            <InputField
              placeholder="Descripción del inmueble"
              helpText="Descripción del inmueble"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              id="description"
              type="text"
              className="mt-2"
              {...register("description")}
              hasError={!!errors.description}
              errorMessage={errors.description?.message}
            />

            <InputField
              placeholder="Whatsapp"
              helpText="Whatsapp"
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
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
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              id="email"
              type="text"
              className="mt-2"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
            />
          </div>
        </section>

        <Button
          colVariant="warning"
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
