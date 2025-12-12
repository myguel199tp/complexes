"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  // Flag,
} from "complexes-next-components";
import Image from "next/image";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";
import { useCountryCityOptions } from "./register-option";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Form() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    setValue,
    formState: { errors },
    // isSuccess,
    onSubmit,
  } = useForm();
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language} className="border-2 p-5 rounded-md mt-3 w-full">
      <div className="w-full flex gap-2 justify-center mt-2">
        <form className="w-full" onSubmit={onSubmit}>
          <section className="md:!flex-row w-full flex  gap-4">
            <div className="w-full">
              <InputField
                placeholder="Nombre"
                helpText="nombre"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder="Apellido"
                helpText="Apellido"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />
              <InputField
                placeholder="Número de identificación"
                helpText="Número de identificación"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("numberId")}
                hasError={!!errors.numberId}
                errorMessage={errors.numberId?.message}
              />
              <SelectField
                className="mt-2"
                defaultOption="Pais"
                helpText="Pais"
                id="ofert"
                options={countryOptions}
                inputSize="lg"
                rounded="md"
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />

              {/* Ciudad */}
              <SelectField
                className="mt-2"
                defaultOption="Ciudad"
                helpText="Cuidad"
                id="ofert"
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
              <InputField
                placeholder="Celular"
                helpText="Celular"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
              <InputField
                placeholder="correo electronico"
                helpText="correo electronico"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
            </div>
            <div className="w-full md:!w-[50%] ml-2 justify-center items-center border-x-4 border-gray-300 p-2">
              {!preview && (
                <>
                  <IoImages
                    size={150}
                    onClick={handleIconClick}
                    className="cursor-pointer text-gray-300"
                  />
                  <div className="flex justify-center items-center">
                    <Text size="sm" tKey={t("solo")}>
                      {" "}
                      solo archivos png - jpg{" "}
                    </Text>
                  </div>
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
                <div className="block">
                  <div className="mt-3">
                    <Image
                      src={preview}
                      width={600}
                      height={600}
                      alt="Vista previa"
                      className="w-full h-full"
                    />
                  </div>
                  <Button
                    className="p-2 mt-2"
                    colVariant="warning"
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
          </section>
          <section className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="w-50%">
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  onClick={() => {
                    router.push(route.termsConditions);
                  }}
                >
                  términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <Text size="sm" colVariant="danger">
                  {errors.termsConditions.message}
                </Text>
              )}
            </div>
          </section>
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            type="submit"
            className="mt-2"
          >
            Registrarse
          </Button>
        </form>
      </div>
    </div>
  );
}
