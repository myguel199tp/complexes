"use client";

import {
  InputField,
  SelectField,
  Button,
  Title,
  Avatar,
} from "complexes-next-components";
import { useState } from "react";
import useForm from "./use-form";
import Link from "next/link";
import { ImSpinner9 } from "react-icons/im";
import { AlertFlag } from "@/app/components/alertFalg";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";

export default function ComercioRegisterForm() {
  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    isSubmitting,
    preview,
    fileInputRef,
    handleIconClick,
    handleFileChange,
  } = useForm();

  const [country, setCountry] = useState("");
  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();
  const selectedOption = countryOptions.find((opt) => opt.value === country);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-10">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.12)]">
          <div className="flex justify-between">
            <div className="flex flemdx-col items-center mb-8">
              <Title as="h2" size="sm" colVariant="on" font="semi">
                Registra tu comercio
              </Title>
              <p className="mt-2 text-center text-sm text-slate-400">
                Crea tu cuenta de comercio independiente de SmartPH
              </p>
            </div>
            <div>
              <Avatar
                src="/icon.png"
                alt={"SmarPH"}
                size="xxl"
                border="thick"
                shape="round"
              />
            </div>
          </div>

          <AlertFlag />

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div
                onClick={handleIconClick}
                className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-cyan-400/60 bg-white/[0.04] hover:border-cyan-300"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Logo del comercio"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-slate-400">
                    Subir imagen
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-center text-xs text-slate-400">
                Imagen del comercio (JPG o PNG)
              </p>
              {errors.logo ? (
                <p className="text-center text-xs text-red-400">
                  {errors.logo.message as string}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                defaultOption="Tipo de comercio"
                helpText="Tipo de comercio"
                sizeHelp="sm"
                id="businessModel"
                options={[
                  { value: "b2c", label: "B2C — venta a clientes finales" },
                  { value: "b2b", label: "B2B — venta directa a conjuntos" },
                ]}
                inputSize="md"
                rounded="md"
                {...register("businessModel")}
                onChange={(e) => {
                  setValue(
                    "businessModel",
                    (e.target.value as "b2c" | "b2b") || "b2c",
                    { shouldValidate: true },
                  );
                }}
                hasError={!!errors.businessModel}
                errorMessage={errors.businessModel?.message}
              />

              <InputField
                placeholder="Nombre del negocio"
                helpText="Nombre del negocio"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("businessName")}
                hasError={!!errors.businessName}
                errorMessage={errors.businessName?.message}
              />

              <InputField
                placeholder="Nombre del propietario"
                helpText="Nombre del propietario"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("ownerName")}
                hasError={!!errors.ownerName}
                errorMessage={errors.ownerName?.message}
              />

              <InputField
                placeholder="Correo electrónico"
                helpText="Correo electrónico"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
                autoComplete="username"
              />

              <InputField
                placeholder="Contraseña"
                helpText="Contraseña"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="password"
                {...register("password")}
                hasError={!!errors.password}
                errorMessage={errors.password?.message}
                autoComplete="new-password"
              />

              <SelectField
                searchable
                defaultOption="Indicativo"
                helpText="Indicativo"
                sizeHelp="sm"
                id="indicative"
                options={indicativeOptions}
                inputSize="md"
                rounded="md"
                {...register("indicative")}
                onChange={(e) => {
                  setValue("indicative", e.target.value, {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.indicative}
                errorMessage={errors.indicative?.message}
              />

              <InputField
                placeholder="Teléfono"
                helpText="Teléfono"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />

              <SelectField
                searchable
                defaultOption="Selecciona tu país"
                helpText="País"
                sizeHelp="sm"
                id="country"
                options={countryOptions}
                inputSize="md"
                rounded="md"
                prefixImage={selectedOption?.image || ""}
                {...register("country")}
                onChange={(e) => {
                  const newCountry = e.target.value || "";
                  setValue("country", newCountry, { shouldValidate: true });
                  setCountry(newCountry);
                  setValue("city", "", { shouldValidate: true });
                  setSelectedCountryId(newCountry || null);
                }}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />

              <SelectField
                searchable
                defaultOption="Selecciona tu ciudad"
                helpText="Ciudad"
                sizeHelp="sm"
                id="city"
                options={cityOptions}
                inputSize="md"
                rounded="md"
                {...register("city")}
                onChange={(e) => {
                  setValue("city", e.target.value || "", {
                    shouldValidate: true,
                  });
                }}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />

              <InputField
                placeholder="NIT / RNC (opcional)"
                helpText="NIT / RNC"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("taxId")}
                hasError={!!errors.taxId}
                errorMessage={errors.taxId?.message}
              />

              <InputField
                placeholder="Dirección (opcional)"
                helpText="Dirección"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("address")}
                hasError={!!errors.address}
                errorMessage={errors.address?.message}
              />
            </div>

            <InputField
              placeholder="Descripción del negocio (opcional)"
              helpText="Descripción"
              sizeHelp="sm"
              inputSize="md"
              rounded="md"
              type="text"
              {...register("description")}
              hasError={!!errors.description}
              errorMessage={errors.description?.message}
            />

            <Button
              colVariant="success"
              size="full"
              rounded="md"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <ImSpinner9 className="animate-spin" />
                </span>
              ) : (
                "Registrar comercio"
              )}
            </Button>
          </form>

          <div className="flex justify-center mt-6">
            <Link href="/comercio/login" className="text-blue-400 font-bold">
              Ya tengo una cuenta de comercio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
