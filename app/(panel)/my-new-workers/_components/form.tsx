"use client";
import React from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
  Buton,
} from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages } from "react-icons/io5";
import Image from "next/image";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";
import { Controller } from "react-hook-form";
import { optionsRol } from "./constants";
import { useForminfo } from "./form-info";

export default function FormComplex() {
  const {
    t,
    handleFileChange,
    takePhoto,
    openCamera,
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
    handleSubmit,
    handleIconClick,
    fileInputRef,
    errors,
    register,
    router,
    control,
    setFormState,
    setValue,
    formState,
    videoRef,
    canvasRef,
  } = useForminfo();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center w-full"
    >
      <section className="flex flex-col gap-1 md:flex-row justify-between w-full">
        {/* Columna izquierda */}

        <div className="w-full">
          <div className="mt-2 w-full">
            <Controller
              control={control}
              name="role"
              rules={{ required: t("tipoUsiarioRequerido") }}
              render={({ field }) => (
                <SelectField
                  id="role"
                  defaultOption={t("tipoUsiario")}
                  helpText={t("tipoUsiario")}
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="lg"
                  value={field.value}
                  options={optionsRol}
                  tKeyError={t("tipoUsiarioRequerido")}
                  hasError={!!errors.role}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setFormState((prev) => ({
                      ...prev,
                      selectedRol: e.target.value,
                    }));
                  }}
                />
              )}
            />
          </div>
          <InputField
            placeholder={t("nombre")}
            helpText={t("nombre")}
            sizeHelp="xxs"
            inputSize="sm"
            rounded="md"
            className="mt-2"
            regexType="letters"
            type="text"
            {...register("name")}
            tKeyError={t("nombreRequerido")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <InputField
            placeholder={t("apellido")}
            helpText={t("apellido")}
            sizeHelp="xs"
            regexType="letters"
            inputSize="sm"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("lastName")}
            tKeyError={t("apellidoRequerido")}
            hasError={!!errors.lastName}
            errorMessage={errors.lastName?.message}
          />
          <div className="flex gap-2">
            <InputField
              placeholder={t("nuemroIdentificacion")}
              helpText={t("nuemroIdentificacion")}
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              regexType="number"
              className="mt-2"
              type="string"
              {...register("numberId", {
                onChange: (e) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedNumberId: e.target.value,
                  })),
              })}
              tKeyError={t("documentoRequerido")}
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />
            <div className="mt-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("nacimiento")}
                  value={formState.birthDate}
                  onChange={(newDate) => {
                    setFormState((prev) => ({
                      ...prev,
                      birthDate: newDate,
                    }));

                    setFormState((prev) => ({
                      ...prev,
                      val: newDate,
                    }));

                    setValue("bornDate", String(newDate), {
                      shouldValidate: true,
                    });
                  }}
                  views={["year", "month", "day"]}
                  format="yyyy-MM-dd"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.bornDate,
                      helperText: errors.bornDate?.message || "",
                      InputProps: {
                        sx: {
                          backgroundColor: "#e5e7eb",
                          borderRadius: "9999px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="block md:!flex items-center gap-3 mt-2">
            <SelectField
              tKeyDefaultOption={t("indicativo")}
              tKeyHelpText={t("indicativo")}
              searchable
              regexType="alphanumeric"
              defaultOption="Indicativo"
              helpText="Indicativo"
              sizeHelp="xxs"
              id="indicative"
              options={indicativeOptions}
              inputSize="sm"
              rounded="lg"
              {...register("indicative")}
              onChange={(e) => {
                setValue("indicative", e.target.value, {
                  shouldValidate: true,
                });
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
              regexType="phone"
              sizeHelp="xxs"
              inputSize="sm"
              rounded="md"
              type="text"
              {...register("phone", {
                required: t("celularRequerido"),
                pattern: {
                  value: /^[0-9]+$/,
                  message: t("soloNumeros"),
                },
              })}
              tKeyError={t("celularRequerido")}
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
            />
          </div>
          <InputField
            placeholder={t("correo")}
            helpText={t("correo")}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            className="mt-2"
            type="email"
            {...register("email")}
            tKeyError={t("correoRequerido")}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
        </div>

        {/* Columna imagen */}
        <div className="w-full border-x-4  p-2 flex flex-col items-center">
          {!formState.preview && !formState.isCameraOpen && (
            <div className="flex flex-col items-center gap-2">
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
              />
              <Button
                size="sm"
                rounded="lg"
                type="button"
                colVariant="warning"
                className="flex gap-4 items-center"
                onClick={openCamera}
              >
                <IoCamera className="mr-1" size={20} />
                <Text size="sm" tKey={t("tomarFoto")} translate="yes">
                  Tomar foto
                </Text>
              </Button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {formState.isCameraOpen && (
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                className="w-full max-w-3xl border rounded-md aspect-video"
              />
              <div className="flex gap-16">
                <Tooltip
                  content="Tomar foto"
                  tKey={t("tomarFoto")}
                  position="bottom"
                  className="bg-gray-200 w-32"
                >
                  <TbLivePhotoFilled
                    onClick={takePhoto}
                    className="mt-4 cursor-pointer text-cyan-800 hover:text-gray-200"
                    size={45}
                  />
                </Tooltip>

                <Tooltip
                  content="Cancelar"
                  tKey={t("cancelar")}
                  position="bottom"
                  className="bg-gray-200 w-32"
                >
                  <GiReturnArrow
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, isCameraOpen: false }))
                    }
                    className="mt-4 cursor-pointer text-red-800 hover:text-gray-200"
                    size={35}
                  />
                </Tooltip>
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="hidden"
              />
            </div>
          )}

          {formState.preview && (
            <div className="mt-3 gap-5">
              <Image
                src={formState.preview}
                width={900}
                height={600}
                alt="Vista previa"
                className="rounded-md border"
              />
              <Button
                size="sm"
                type="button"
                className="mt-2"
                colVariant="primary"
                onClick={openCamera}
              >
                Tomar otra
              </Button>
              <Button
                size="sm"
                type="button"
                colVariant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar imagen
              </Button>
            </div>
          )}
        </div>

        <div className="w-full ">
          <div className="mt-2">
            <SelectField
              defaultOption="Pais"
              helpText="Pais"
              sizeHelp="xs"
              id="country"
              regexType="alphanumeric"
              options={countryOptions}
              inputSize="md"
              rounded="lg"
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
          </div>
          <div className="mt-2">
            <SelectField
              defaultOption="Ciudad"
              helpText="Ciudad"
              sizeHelp="xs"
              regexType="alphanumeric"
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

          <div className="flex items-center mt-3 gap-2">
            <input type="checkbox" {...register("termsConditions")} />
            <Buton
              type="button"
              borderWidth="none"
              onClick={() => {
                router.push(route.termsConditions);
              }}
              className="text-sm text-cyan-600 underline"
            >
              Términos y condiciones aceptados
            </Buton>
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
        colVariant="warning"
        size="full"
        className="mt-4"
      >
        Agregar usuario
      </Button>
    </form>
  );
}
