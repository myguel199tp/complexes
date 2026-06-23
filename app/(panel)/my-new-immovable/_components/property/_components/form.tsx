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
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { phoneLengthByCountry } from "@/app/helpers/longitud-telefono";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

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
  const [videoType, setVideoType] = useState<"upload" | "youtube" | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("COP");
  const planRaw = useConjuntoStore((state) => state.plan);
  const canUploadVideo = planRaw === "platinum";
  const [kindImmovable, setkindImmovable] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm();

  const {
    countryOptions,
    cityOptions,
    setSelectedCountryId,
    indicativeOptions,
    currencyOptions,
  } = useCountryCityOptions();

  const handleIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const showAlert = useAlertStore((state) => state.showAlert);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setPreviews([]);
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      showAlert("Solo se permiten archivos PNG o JPG", "error");
    }

    if (validFiles.length > 0) {
      setValue("files", validFiles, { shouldValidate: true });
      const urls = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
    } else {
      setPreviews([]);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [maxLengthCellphone, setMaxLengthCellphone] = useState<
    number | undefined
  >(undefined);

  return (
    <form key={language} onSubmit={handleSubmit} className="space-y-5">
      <section className="flex flex-col gap-5 md:!flex-row justify-between">
        <div className="w-full md:!w-[30%] bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <Text size="xs" font="bold" className="text-gray-400 uppercase tracking-wide mb-1">
            Datos del inmueble
          </Text>
          <div className="mt-2">
            <Controller
              name="ofert"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  defaultOption="Tipo de oferta"
                  helpText="Tipo de oferta"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="lg"
                  options={ofertOptions}
                  hasError={!!errors.ofert}
                  errorMessage={errors.ofert?.message}
                />
              )}
            />
          </div>

          <InputField type="hidden" {...register("conjuntoId")} />

          <div className="mt-2">
            <Controller
              name="property"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  defaultOption="Tipo de inmueble"
                  helpText="Tipo de inmueble"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="lg"
                  options={propertyOptions}
                  hasError={!!errors.property}
                  errorMessage={errors.property?.message}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setkindImmovable(selectedValue);
                    field.onChange(selectedValue);
                  }}
                />
              )}
            />
          </div>
          {(!kindImmovable || [5, 7, 8].includes(Number(kindImmovable))) && (
            <div className="mt-2">
              <Controller
                name="room"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    defaultOption="# de habitaciones"
                    helpText="# de habitaciones"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="lg"
                    options={roomOptions}
                    hasError={!!errors.room}
                    errorMessage={errors.room?.message}
                  />
                )}
              />
            </div>
          )}

          {(!kindImmovable ||
            [1, 2, 4, 5, 6, 7, 8].includes(Number(kindImmovable))) && (
            <div className="mt-2">
              <Controller
                name="restroom"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    defaultOption="# de baños"
                    helpText="# de baños"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="lg"
                    options={restroomOptions}
                    hasError={!!errors.restroom}
                    errorMessage={errors.restroom?.message}
                  />
                )}
              />
            </div>
          )}

          {(!kindImmovable ||
            [1, 2, 4, 5, 6, 7, 8].includes(Number(kindImmovable))) && (
            <div className="mt-2">
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    defaultOption="Antigüedad inmueble"
                    helpText="Antigüedad inmueble"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="lg"
                    options={antiquitygOptions}
                    hasError={!!errors.age}
                    errorMessage={errors.age?.message}
                  />
                )}
              />
            </div>
          )}

          <div className="mt-2">
            <Controller
              name="parking"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  defaultOption="# de parqueaderos"
                  helpText="# de parqueaderos"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="lg"
                  options={parkingOptions}
                  hasError={!!errors.parking}
                  errorMessage={errors.parking?.message}
                />
              )}
            />
          </div>
          <div className="mt-2">
            <SelectField
              searchable
              defaultOption="Moneda"
              helpText="Moneda"
              sizeHelp="xs"
              id="currency"
              options={currencyOptions}
              inputSize="md"
              rounded="lg"
              {...register("currency")}
              onChange={(e) => {
                const value = e.target.value || "COP";
                setSelectedCurrency(value);
                setValue("currency", value, { shouldValidate: true });
              }}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>
          <InputField
            placeholder={`${selectedCurrency} Precio`}
            helpText={`${selectedCurrency} Precio`}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            id="price"
            type="text"
            className="mt-2"
            {...register("price")}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              const input = e.currentTarget;
              const value = input.value.replace(/\D/g, "");
              const formatted = new Intl.NumberFormat("es-CL").format(
                Number(value),
              );
              input.value = formatted;
              setValue("price", String(value), { shouldValidate: true });
            }}
          />

          <InputField
            placeholder="Valor Administración"
            helpText="Valor Administración"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            id="administration"
            type="text"
            className="mt-2"
            {...register("administration")}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              const input = e.currentTarget;
              const value = input.value.replace(/\D/g, "");
              const formatted = new Intl.NumberFormat("es-CL").format(
                Number(value),
              );
              input.value = formatted;
              setValue("administration", String(value), {
                shouldValidate: true,
              });
            }}
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
                  inputSize="lg"
                  rounded="md"
                  options={anemitieUnityOptions}
                  disabled={false}
                  onChange={field.onChange}
                  hasError={!!errors.amenitiesResident}
                  errorMessage={errors.amenitiesResident?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="w-full md:!w-[40%] bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <Text size="xs" font="bold" className="text-gray-400 uppercase tracking-wide mb-1">
            Multimedia
          </Text>
          <div
            className={`w-full border border-gray-200 rounded-2xl bg-gray-50/40 h-auto p-4 mt-3 ${
              !canUploadVideo ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <Text size="sm" font="bold" className="text-gray-700">
                Video de la propiedad (opcional)
              </Text>
              <Button size="sm" colVariant="success">
                Activar video
              </Button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full border border-gray-300 bg-white hover:border-cyan-700 transition-colors has-[:checked]:bg-cyan-700 has-[:checked]:border-cyan-700 has-[:checked]:text-white">
                <input
                  type="radio"
                  name="videoType"
                  disabled={!canUploadVideo}
                  value="upload"
                  checked={videoType === "upload"}
                  onChange={() => setVideoType("upload")}
                  className="accent-cyan-700"
                />
                <Text size="sm">Subir video</Text>
              </label>

              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full border border-gray-300 bg-white hover:border-cyan-700 transition-colors has-[:checked]:bg-cyan-700 has-[:checked]:border-cyan-700 has-[:checked]:text-white">
                <input
                  type="radio"
                  name="videoType"
                  disabled={!canUploadVideo}
                  value="youtube"
                  checked={videoType === "youtube"}
                  onChange={() => setVideoType("youtube")}
                  className="accent-cyan-700"
                />
                <Text size="sm">Enlace de YouTube</Text>
              </label>
            </div>

            {videoType === "upload" && (
              <>
                {watch("video") ? (
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(watch("video"))}
                      controls
                      className="w-full h-auto rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setValue("video", null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-[220px] cursor-pointer border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:border-cyan-700 transition-colors"
                  >
                    <Text size="sm" className="text-gray-400">
                      Haz clic para subir un video (.mp4, máx. 100 MB)
                    </Text>
                  </div>
                )}

                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi"
                  ref={videoInputRef}
                  className="hidden"
                  disabled={!canUploadVideo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("video", file, { shouldValidate: true });
                    }
                  }}
                />

                {errors.video && (
                  <Text size="sm" colVariant="danger">
                    {errors.video.message}
                  </Text>
                )}
              </>
            )}

            {videoType === "youtube" && (
              <div>
                <InputField
                  placeholder="Enlace de video (YouTube, Vimeo, etc.)"
                  helpText="Pega el enlace de un video de la propiedad"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  disabled={!canUploadVideo}
                  className="mt-2"
                  type="url"
                  {...register("videoUrl")}
                  hasError={!!errors.videoUrl}
                  errorMessage={errors.videoUrl?.message}
                />

                {watch("videoUrl")?.includes("youtube.com") && (
                  <iframe
                    className="w-full h-64 mt-2 rounded-xl"
                    src={watch("videoUrl")!.replace("watch?v=", "embed/")}
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </div>

          {previews.length === 0 ? (
            <>
              <div
                onClick={handleIconClick}
                className="mt-4 flex flex-col items-center justify-center gap-2 p-8 border border-dashed border-gray-300 rounded-xl bg-gray-50 transition hover:border-cyan-500 cursor-pointer"
              >
                <IoImages className="cursor-pointer text-gray-400 hover:text-cyan-600 transition w-24 h-24" />
                <Text size="md" className="text-gray-600">Imágenes de la propiedad</Text>
                <Text colVariant="primary" size="sm" tKey={t("solo")}>
                  solo archivos png - jpg
                </Text>
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <>
              <div className="max-h-[600px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1 mt-3">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                  >
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
                      {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                    >
                      <IoClose size={14} />
                    </button>

                    <Image
                      src={src}
                      width={300}
                      height={300}
                      alt={`Vista previa ${index}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              <div className="flex mt-3 gap-3 items-center px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <IoImages
                  size={28}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-400 hover:text-cyan-700 transition-colors shrink-0"
                />
                <Text
                  size="sm"
                  className={`${
                    previews.length > 10 ? "text-red-500" : "text-gray-500"
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

        <div className="w-full md:!w-[30%] bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <Text size="xs" font="bold" className="text-gray-400 uppercase tracking-wide mb-1">
            Ubicación y contacto
          </Text>
          <div className="mt-2">
            <SelectField
              searchable
              defaultOption="Pais"
              helpText="Pais"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              id="country"
              options={countryOptions}
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
              inputSize="md"
              rounded="lg"
              id="city"
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
            placeholder="Barrio"
            helpText="Barrio"
            sizeHelp="xs"
            inputSize="sm"
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
            sizeHelp="xs"
            inputSize="sm"
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
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            id="area"
            type="text"
            className="mt-2"
            {...register("area")}
            hasError={!!errors.area}
            errorMessage={errors.area?.message}
          />

          <div className="flex items-center gap-3 mt-2">
            <SelectField
              tKeyDefaultOption={t("indicativo")}
              tKeyHelpText={t("indicativo")}
              searchable
              tkeySearch={t("buscarNoticia")}
              defaultOption="Indicativo"
              helpText="Indicativo"
              sizeHelp="xs"
              id="indicative"
              options={indicativeOptions}
              inputSize="md"
              rounded="lg"
              {...register("indicative")}
              onChange={(e) => {
                const selected = e.target.value;
                setValue("indicative", selected, { shouldValidate: true });

                const [, countryCode] = selected.split("-");
                const maxLen =
                  phoneLengthByCountry[
                    countryCode as keyof typeof phoneLengthByCountry
                  ];

                setMaxLengthCellphone(maxLen);
              }}
              tKeyError={t("idicativoRequerido")}
              hasError={!!errors.indicative}
              errorMessage={errors.indicative?.message}
            />
            <InputField
              required
              tKeyHelpText={t("celular")}
              tKeyPlaceholder={t("celular")}
              placeholder="Celular"
              helpText="Celular"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              type="number"
              {...register("phone")}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (maxLengthCellphone)
                  value = value.slice(0, maxLengthCellphone);
                setValue("phone", value, { shouldValidate: true });
              }}
              tKeyError={t("celularRequerido")}
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
            />
          </div>

          <InputField
            placeholder="Correo electronico"
            helpText="Correo electronico"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
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
                  inputSize="lg"
                  rounded="md"
                  options={amenitiesOptions}
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

      <div>
        <Text size="xs" className="text-gray-500 font-medium mb-1.5">
          Descripción
        </Text>
        <TextAreaField
          {...register("description")}
          className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción"
        />
      </div>

      <Button
        colVariant="success"
        size="full"
        rounded="md"
        type="submit"
        className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
      >
        Agregar Inmueble
      </Button>
    </form>
  );
}
