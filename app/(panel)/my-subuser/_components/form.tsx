"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FormComplex() {
  const router = useRouter();
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedplaque, setSelectedPlaque] = useState("");
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    handleIconClick,
    fileInputRef,
  } = useForm({
    role: selectedRol,
    apartment: selectedApartment,
    plaque: selectedplaque,
    numberid: selectedNumberId,
    block: selectedBlock,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const optionsRol = [{ value: "resident", label: "Familiar" }];
  const optionsRoRent = [{ value: "tenant", label: "Arrendatario" }];
  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  return (
    <div className="w-full p-2">
      <div className="w-full flex gap-2 justify-center shadow-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center w-full p-4"
        >
          <section className="flex flex-col gap-4 md:flex-row justify-between w-full">
            {/* Columna izquierda */}
            <div className="w-full md:w-[45%]">
              <InputField
                placeholder={t("nombre")}
                helpText={t("nombre")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder={t("apellido")}
                helpText={t("apellido")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />
              <InputField
                placeholder={t("nuemroIdentificacion")}
                helpText={t("nuemroIdentificacion")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="number"
                {...register("numberid", {
                  onChange: (e) => setSelectedNumberId(e.target.value),
                })}
                hasError={!!errors.numberid}
                errorMessage={errors.numberid?.message}
              />
              <DatePicker
                selected={birthDate}
                onChange={(date) => {
                  setBirthDate(date);
                  setValue("bornDate", String(date), { shouldValidate: true }); // 🔑 conecta con RHF
                }}
                placeholderText={t("nacimiento")}
                dateFormat="yyyy-MM-dd"
                className="w-full"
                isClearable
                customInput={
                  <InputField
                    placeholder={t("nacimiento")}
                    helpText={t("nacimiento")}
                    sizeHelp="xs"
                    inputSize="sm"
                    rounded="lg"
                    className="mt-2"
                    hasError={!!errors.bornDate}
                    errorMessage={errors.bornDate?.message}
                  />
                }
              />
              <InputField
                placeholder={t("celular")}
                helpText={t("celular")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
              <InputField
                placeholder={t("correo")}
                helpText={t("correo")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
            </div>

            {/* Columna imagen */}
            <div className="w-full md:w-[30%] border-x-4  p-2 flex flex-col items-center">
              {!preview && (
                <>
                  <IoImages
                    size={150}
                    onClick={handleIconClick}
                    className="cursor-pointer text-gray-200"
                  />
                  <Text size="sm">Solo archivos PNG - JPG</Text>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              {preview && (
                <div className="mt-3">
                  <Image
                    src={preview}
                    width={300}
                    height={130}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                  <Button
                    className="p-2 mt-2"
                    colVariant="primary"
                    size="sm"
                    onClick={handleIconClick}
                  >
                    Cargar otra
                  </Button>
                </div>
              )}

              {errors.file && (
                <Text size="xs" colVariant="danger">
                  {errors.file.message}
                </Text>
              )}
            </div>

            {/* Columna derecha */}
            <div className="w-full md:w-[45%]">
              {/* Campos ocultos */}
              <SelectField
                defaultOption={t("seleccionpais")}
                helpText={t("seleccionpais")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                id="ofert"
                options={countryOptions}
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, { shouldValidate: true });
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />
              <div className="w-full mt-2">
                <SelectField
                  defaultOption={t("seleccionaciudad")}
                  helpText={t("seleccionaciudad")}
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  options={cityOptions}
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
                placeholder={t("torre")}
                helpText={t("torre")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedBlock(e.target.value)}
              />
              <InputField
                placeholder={t("numeroInmuebleResidencial")}
                helpText={t("numeroInmuebleResidencial")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedApartment(e.target.value)}
              />
              <div className="mt-2 w-full">
                <SelectField
                  id="role"
                  defaultOption={t("tipoUsiario")}
                  helpText={t("tipoUsiario")}
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  value={selectedRol}
                  options={optionsRol}
                  hasError={!!errors.role}
                  {...register("role", {
                    onChange: (e) => setSelectedRol(e.target.value),
                  })}
                />
              </div>
              <div className="mt-2 w-full">
                <SelectField
                  id="role"
                  defaultOption={t("tipoUsiario")}
                  helpText={t("tipoUsiario")}
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  value={selectedRol}
                  options={optionsRoRent}
                  hasError={!!errors.role}
                  {...register("role", {
                    onChange: (e) => setSelectedRol(e.target.value),
                  })}
                />
              </div>

              <InputField
                placeholder={t("numeroPlaca")}
                helpText={t("numeroPlaca")}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedPlaque(e.target.value)}
                // {...register("plaque", {
                //   onChange: (e) => setSelectedPlaque(e.target.value),
                // })}
              />
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  type="button"
                  onClick={() => {
                    router.push(route.termsConditions);
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <Text colVariant="danger" size="xs">
                  {errors.termsConditions.message}
                </Text>
              )}
            </div>
          </section>

          <Button
            type="submit"
            tKey={t("agregarUsuario")}
            translate="yes"
            disabled={selectedApartment === ""}
            colVariant="warning"
            size="full"
            className="mt-4"
          >
            Agregar usuario
          </Button>
        </form>
      </div>
    </div>
  );
}
