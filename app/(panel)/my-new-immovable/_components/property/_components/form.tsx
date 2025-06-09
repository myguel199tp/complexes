"use client";
import {
  Buton,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import RegisterOptions from "./regsiter-options";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";

export default function Form() {
  const {
    antiquitygOptions,
    parkingOptions,
    roomOptions,
    restroomOptions,
    ofertOptions,
    propertyOptions,
    stratumOptions,
  } = RegisterOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    isSuccess,
    setValue,
  } = useForm();
  const [previews, setPreviews] = useState<string[]>([]);

  const [formState, setFormState] = useState({
    ofert: "",
    property: "",
    room: "",
    restroom: "",
    stratum: "",
    age: "",
    parking: "",
  });

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
          <div className="w-full md:!w-[45%]">
            <SelectField
              className="mt-2"
              defaultOption="Tipo de oferta"
              id="ofert"
              options={ofertOptions}
              value={formState.ofert}
              inputSize="lg"
              rounded="md"
              {...register("ofert", {
                onChange: (e) => setFormState(e.target.value),
              })}
              hasError={!!errors.ofert}
              errorMessage={errors.ofert?.message}
            />
            <SelectField
              className="mt-2"
              defaultOption="Tipo de inmueble"
              id="property"
              options={propertyOptions}
              value={formState.property}
              inputSize="lg"
              rounded="md"
              {...register("property", {
                onChange: (e) =>
                  setFormState((prev) => ({
                    ...prev,
                    property: e.target.value,
                  })),
              })}
              hasError={!!errors.property}
              errorMessage={errors.property?.message}
            />
            {["1", "2", "8"].includes(formState.property) ? (
              <SelectField
                className="mt-2"
                defaultOption="# de habitaciones"
                id="room"
                options={roomOptions}
                value={formState.room}
                inputSize="lg"
                rounded="md"
                {...register("room", {
                  onChange: (e) =>
                    setFormState((prev) => ({
                      ...prev,
                      room: e.target.value,
                    })),
                })}
                hasError={!!errors.room}
                errorMessage={errors.room?.message}
              />
            ) : null}

            {["1", "2", "3", "4", "5", "7", "8"].includes(
              formState.property
            ) ? (
              <SelectField
                className="mt-2"
                defaultOption="# de baños"
                id="restroom"
                options={restroomOptions}
                value={formState.restroom}
                inputSize="lg"
                rounded="md"
                {...register("restroom", {
                  onChange: (e) => setFormState(e.target.value),
                })}
                hasError={!!errors.restroom}
                errorMessage={errors.restroom?.message}
              />
            ) : null}

            <SelectField
              className="mt-2"
              defaultOption="Estrato"
              options={stratumOptions}
              inputSize="lg"
              value={formState.stratum}
              rounded="md"
              {...register("stratum", {
                onChange: (e) => setFormState(e.target.value),
              })}
              hasError={!!errors.stratum}
              errorMessage={errors.stratum?.message}
            />
            <SelectField
              className="mt-2"
              defaultOption="Antiguedad inmueble"
              id="age"
              options={antiquitygOptions}
              value={formState.age}
              inputSize="lg"
              rounded="md"
              {...register("age", {
                onChange: (e) => setFormState(e.target.value),
              })}
              hasError={!!errors.age}
              errorMessage={errors.age?.message}
            />
            <SelectField
              className="mt-2"
              defaultOption="# de parqueaderos"
              id="parking"
              options={parkingOptions}
              value={formState.parking}
              inputSize="lg"
              rounded="md"
              {...register("parking", {
                onChange: (e) => setFormState(e.target.value),
              })}
              hasError={!!errors.parking}
              errorMessage={errors.parking?.message}
            />
            <InputField
              placeholder="precio"
              inputSize="full"
              rounded="md"
              id="price"
              type="text"
              className="mt-2"
              {...register("price")}
              hasError={!!errors.price}
              errorMessage={errors.price?.message}
            />
          </div>
          <div className="w-full md:!w-[30%] border-x-4 border-cyan-800 p-1">
            <InputField
              placeholder="Barrio"
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
              inputSize="full"
              rounded="md"
              id="address"
              type="text"
              className="mt-2"
              {...register("address")}
              hasError={!!errors.address}
              errorMessage={errors.address?.message}
            />
            <>
              {previews.length === 0 && (
                <>
                  <IoImages
                    size={150}
                    onClick={handleIconClick}
                    className="cursor-pointer text-cyan-800"
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
              )}

              {previews.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 mt-2">
                  {previews.map((src, index) => (
                    <div
                      key={index}
                      className="group w-fit rounded-md overflow-hidden"
                    >
                      <Image
                        src={src}
                        width={200}
                        height={150}
                        alt={`Vista previa ${index}`}
                        className="w-full max-w-xs rounded-md border transition-transform duration-300 group-hover:scale-125"
                      />
                    </div>
                  ))}
                </div>
              )}
              {previews.length > 0 && (
                <div className="flex mt-2 gap-4">
                  <IoImages
                    size={50}
                    onClick={handleIconClick}
                    className="cursor-pointer"
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
              )}
            </>
          </div>
          <div className="w-full md:!w-[45%]">
            <InputField
              placeholder="país"
              inputSize="full"
              rounded="md"
              id="country"
              type="text"
              className="mt-2"
              {...register("country")}
              hasError={!!errors.country}
              errorMessage={errors.country?.message}
            />
            <InputField
              placeholder="ciudad"
              inputSize="full"
              rounded="md"
              id="city"
              type="text"
              className="mt-2"
              {...register("city")}
              hasError={!!errors.city}
              errorMessage={errors.city?.message}
            />
            <InputField
              placeholder="valor administración"
              inputSize="full"
              rounded="md"
              id="administration"
              type="text"
              className="mt-2"
              {...register("administration")}
              hasError={!!errors.administration}
              errorMessage={errors.administration?.message}
            />
            <InputField
              placeholder="Área construida"
              inputSize="full"
              rounded="md"
              id="area"
              type="text"
              className="mt-2"
              {...register("area")}
              hasError={!!errors.area}
              errorMessage={errors.area?.message}
            />
            <InputField
              placeholder="Descripción del inmueble"
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
              placeholder="whatsapp"
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
        <Buton
          colVariant="primary"
          size="full"
          rounded="md"
          borderWidth="semi"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar Immueble</Text>
        </Buton>
      </form>
    </div>
  );
}
