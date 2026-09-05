"use client";

import {
  InputField,
  SelectField,
  MultiSelect,
  TextAreaField,
  Button,
  Title,
  Text,
} from "complexes-next-components";
import { useMemo, useState } from "react";
import useForm from "./use-form";
import Link from "next/link";
import { ImSpinner9 } from "react-icons/im";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { MdMarkEmailUnread, MdStorefront } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOfficeBuilding } from "react-icons/hi";
import { AlertFlag } from "@/app/components/alertFalg";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { B2B_SERVICE_CATEGORIES } from "@/app/helpers/b2bServiceCategories";
import { route } from "@/app/_domain/constants/routes";

/**
 * El modelo de negocio no es un campo más: define de qué se compone la cuenta
 * (sucursales y productos, o planes vendidos a conjuntos) y no se cambia
 * después. Por eso se elige arriba y como tarjeta, no perdido en un select
 * idéntico a los otros diez campos.
 */
const BUSINESS_MODELS = [
  {
    value: "b2c" as const,
    icon: MdStorefront,
    title: "B2C — Clientes finales",
    description:
      "Vendes productos o servicios a los residentes. Manejas sucursales, catálogo y pedidos.",
  },
  {
    value: "b2b" as const,
    icon: HiOfficeBuilding,
    title: "B2B — Conjuntos",
    description:
      "Vendes planes de servicio recurrente directamente a las copropiedades, a nivel nacional.",
  },
];

/** Encabezado de sección: agrupa los campos para que el formulario se lea por bloques. */
function SectionTitle({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
        {step}
      </span>
      <Text size="sm" className="font-semibold text-slate-200">
        {children}
      </Text>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function ComercioRegisterForm() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    onSubmit,
    isSubmitting,
    preview,
    fileInputRef,
    handleIconClick,
    handleFileChange,
  } = useForm();

  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    data,
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();
  const selectedOption = countryOptions.find((opt) => opt.value === country);
  const businessModel = watch("businessModel");
  const isB2b = businessModel === "b2b";
  const serviceCategories = watch("serviceCategories") ?? [];
  const coverageCities = watch("coverageCities") ?? [];

  /**
   * La cobertura se guarda por *nombre* de ciudad, no por id como `city`: el
   * emparejamiento con las demandas de los conjuntos compara nombres
   * normalizados (`cityNormalized`), así que guardar el id aquí dejaría la
   * cobertura sin poder compararse con nada.
   */
  const coverageCityOptions = useMemo(
    () =>
      data
        .find((c) => String(c.ids) === country)
        ?.city?.map((c) => ({
          value: String(c.name ?? ""),
          label: `${String(c.name ?? "")} (${String(c.state?.name ?? "")})`,
        }))
        .filter((o) => o.value !== "") ?? [],
    [data, country],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-10">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur-2xl md:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="globaliaph"
              className="mb-4 h-16 w-16 rounded-2xl shadow-lg"
            />
            <Title as="h1" size="sm" colVariant="on" font="semi">
              Registra tu comercio
            </Title>
            <Text size="sm" className="mt-2 max-w-md text-slate-400">
              Crea tu cuenta de comercio, independiente de tu cuenta de
              globaliaph.
            </Text>
          </div>

          <AlertFlag />

          <form onSubmit={onSubmit} className="space-y-10">
            {/* 1. Modelo de negocio */}
            <section>
              <SectionTitle step={1}>Cómo vendes</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                {BUSINESS_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isActive = businessModel === model.value;
                  return (
                    <button
                      key={model.value}
                      type="button"
                      onClick={() =>
                        setValue("businessModel", model.value, {
                          shouldValidate: true,
                        })
                      }
                      aria-pressed={isActive}
                      className={`flex h-full flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={
                          isActive ? "text-cyan-300" : "text-slate-400"
                        }
                      />
                      <Text
                        size="sm"
                        className={`font-semibold ${
                          isActive ? "text-cyan-200" : "text-slate-200"
                        }`}
                      >
                        {model.title}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {model.description}
                      </Text>
                    </button>
                  );
                })}
              </div>
              <Text size="xs" className="mt-2 text-slate-500">
                Esta elección define las funciones de tu panel y no se puede
                cambiar después.
              </Text>
              {errors.businessModel ? (
                <Text size="xs" colVariant="danger" className="mt-1">
                  {errors.businessModel.message}
                </Text>
              ) : null}
            </section>

            {/* 2. Identidad del negocio */}
            <section>
              <SectionTitle step={2}>Datos del negocio</SectionTitle>

              <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                <div
                  onClick={handleIconClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleIconClick();
                  }}
                  className={`flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white/[0.04] transition hover:border-cyan-300 ${
                    errors.logo ? "border-red-400/70" : "border-cyan-400/60"
                  }`}
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
                      Subir logo
                    </span>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <Text size="sm" className="text-slate-300">
                    Logo del comercio
                  </Text>
                  <Text size="xs" className="mt-1 text-slate-500">
                    JPG o PNG, máximo 5 MB. Es lo primero que ven tus clientes.
                  </Text>
                  {errors.logo ? (
                    <Text size="xs" colVariant="danger" className="mt-1">
                      {errors.logo.message as string}
                    </Text>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  regexType="safeChars"
                  placeholder="Ej. Ferretería El Tornillo"
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
                  regexType="letters"
                  placeholder="Nombre y apellido"
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
                  regexType="alphanumeric"
                  placeholder="NIT / RNC"
                  helpText={isB2b ? "NIT / RNC" : "NIT / RNC (opcional)"}
                  sizeHelp="sm"
                  inputSize="md"
                  rounded="md"
                  type="text"
                  {...register("taxId")}
                  hasError={!!errors.taxId}
                  errorMessage={errors.taxId?.message}
                />

                <InputField
                  placeholder="Calle, número, barrio"
                  helpText="Dirección (opcional)"
                  sizeHelp="sm"
                  inputSize="md"
                  rounded="md"
                  type="text"
                  {...register("address")}
                  hasError={!!errors.address}
                  errorMessage={errors.address?.message}
                />

                <InputField
                  placeholder="https://tunegocio.com"
                  helpText="Sitio web o red social (opcional)"
                  sizeHelp="sm"
                  inputSize="md"
                  rounded="md"
                  type="url"
                  {...register("website")}
                  hasError={!!errors.website}
                  errorMessage={errors.website?.message}
                />

                <InputField
                  regexType="number"
                  placeholder="Ej. 8"
                  helpText="Años de experiencia (opcional)"
                  sizeHelp="sm"
                  inputSize="md"
                  rounded="md"
                  type="number"
                  min={0}
                  {...register("yearsExperience")}
                  hasError={!!errors.yearsExperience}
                  errorMessage={errors.yearsExperience?.message}
                />
              </div>

              <div className="mt-4">
                <Text size="sm" colVariant="on">
                  Descripción del negocio (opcional)
                </Text>
                <TextAreaField
                  {...register("description")}
                  rows={3}
                  maxLength={500}
                  placeholder={
                    businessModel === "b2b"
                      ? "Qué servicios prestas a los conjuntos, experiencia y cobertura."
                      : "Qué vendes, a quién y qué te diferencia."
                  }
                  sizeHelp="sm"
                  className="mt-2 bg-gray-200 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  hasError={!!errors.description}
                  errorMessage={errors.description?.message}
                />
              </div>
            </section>

            {/* 3. Contacto y ubicación */}
            <section>
              <SectionTitle step={3}>Contacto y ubicación</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-3">
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
                    regexType="phone"
                    placeholder="300 000 0000"
                    helpText="Teléfono"
                    sizeHelp="sm"
                    inputSize="md"
                    rounded="md"
                    type="tel"
                    {...register("phone")}
                    hasError={!!errors.phone}
                    errorMessage={errors.phone?.message}
                  />
                </div>
              </div>
            </section>

            {/* 4. Solo B2B: qué presta y dónde */}
            {isB2b ? (
              <section>
                <SectionTitle step={4}>Servicios y cobertura</SectionTitle>
                <div className="grid gap-4">
                  <div>
                    <MultiSelect
                      searchable
                      defaultOption="Selecciona los servicios que prestas"
                      helpText="Servicios que prestas"
                      sizeHelp="sm"
                      options={B2B_SERVICE_CATEGORIES}
                      inputSize="full"
                      rounded="md"
                      value={serviceCategories}
                      onChange={(values) =>
                        setValue(
                          "serviceCategories",
                          values as typeof serviceCategories,
                          { shouldValidate: true },
                        )
                      }
                      hasError={!!errors.serviceCategories}
                      errorMessage={
                        errors.serviceCategories?.message as string | undefined
                      }
                    />
                    <Text size="xs" className="mt-1 text-slate-500">
                      Es lo que hace que los conjuntos te encuentren y que te
                      lleguen las convocatorias de tu rubro.
                    </Text>
                  </div>

                  <div>
                    <MultiSelect
                      searchable
                      defaultOption={
                        country
                          ? "Selecciona las ciudades donde atiendes"
                          : "Elige primero un país"
                      }
                      helpText="Ciudades donde prestas servicio (opcional)"
                      sizeHelp="sm"
                      options={coverageCityOptions}
                      inputSize="full"
                      rounded="md"
                      disabled={!country}
                      value={coverageCities}
                      onChange={(values) =>
                        setValue("coverageCities", values, {
                          shouldValidate: true,
                        })
                      }
                      hasError={!!errors.coverageCities}
                      errorMessage={
                        errors.coverageCities?.message as string | undefined
                      }
                    />
                    <Text size="xs" className="mt-1 text-slate-500">
                      Si lo dejas vacío se asume cobertura nacional.
                    </Text>
                  </div>
                </div>
              </section>
            ) : null}

            {/* 5. Acceso a la cuenta */}
            <section>
              <SectionTitle step={isB2b ? 5 : 4}>
                Acceso a la cuenta
              </SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  regexType="email"
                  placeholder="correo@negocio.com"
                  helpText="Correo electrónico"
                  prefixElement={<MdMarkEmailUnread size={15} />}
                  sizeHelp="sm"
                  inputSize="md"
                  rounded="md"
                  type="email"
                  {...register("email")}
                  hasError={!!errors.email}
                  errorMessage={errors.email?.message}
                  autoComplete="username"
                />

                <div className="hidden md:block" />

                <div className="relative">
                  <InputField
                    placeholder="Mínimo 6 caracteres"
                    helpText="Contraseña"
                    prefixElement={<RiLockPasswordLine size={15} />}
                    sizeHelp="sm"
                    inputSize="md"
                    rounded="md"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    hasError={!!errors.password}
                    errorMessage={errors.password?.message}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <IoEyeOffSharp size={18} />
                    ) : (
                      <IoEyeSharp size={18} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <InputField
                    placeholder="Repite la contraseña"
                    helpText="Confirmar contraseña"
                    prefixElement={<RiLockPasswordLine size={15} />}
                    sizeHelp="sm"
                    inputSize="md"
                    rounded="md"
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                    hasError={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword?.message}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirm ? (
                      <IoEyeOffSharp size={18} />
                    ) : (
                      <IoEyeSharp size={18} />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Términos y envío */}
            <div className="border-t border-white/10 pt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-cyan-400"
                  {...register("termsAccepted")}
                />
                <Text size="sm" className="text-slate-300">
                  Acepto los{" "}
                  <Link
                    href={route.termsConditions}
                    target="_blank"
                    className="text-cyan-400 underline"
                  >
                    términos y condiciones
                  </Link>{" "}
                  y el tratamiento de mis datos.
                </Text>
              </label>
              {errors.termsAccepted ? (
                <Text size="xs" colVariant="danger" className="mt-1">
                  {errors.termsAccepted.message}
                </Text>
              ) : null}

              <Button
                colVariant="success"
                size="full"
                rounded="md"
                type="submit"
                disabled={isSubmitting}
                className="mt-5 !py-3 text-base font-semibold shadow-md transition-shadow hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <ImSpinner9 className="animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  "Registrar comercio"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 flex justify-center">
            <Link
              href="/comercio/login"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Ya tengo una cuenta de comercio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
