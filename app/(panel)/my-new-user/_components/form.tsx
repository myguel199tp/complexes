"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages } from "react-icons/io5";
import Image from "next/image";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";
import { Controller, useFieldArray } from "react-hook-form";
import { optionsRol } from "./constants";

export default function FormComplex() {
  const router = useRouter();
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedplaque, setSelectedPlaque] = useState("");
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedMainResidence, setSelectedMainResidence] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  console.log("selectedRol", selectedRol);
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    handleIconClick,
    fileInputRef,
    control,
  } = useForm({
    role: selectedRol,
    apartment: selectedApartment,
    plaque: selectedplaque,
    numberid: selectedNumberId,
    tower: selectedBlock,
    isMainResidence: selectedMainResidence,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "population",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error abriendo cámara:", err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageData = canvasRef.current.toDataURL("image/png");

        // convertir base64 a File
        fetch(imageData)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "foto.png", { type: "image/png" });
            setValue("file", file, { shouldValidate: true });
          });

        setPreview(imageData);
        setIsCameraOpen(false);

        // detener la cámara
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const [birthDate, setBirthDate] = useState<Date | null>(null);
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
                  inputSize="sm"
                  rounded="lg"
                  value={field.value}
                  options={optionsRol}
                  tKeyError={t("tipoUsiarioRequerido")}
                  hasError={!!errors.role}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setSelectedRol(e.target.value);
                  }}
                />
              )}
            />
          </div>
          <InputField
            placeholder={t("nombre")}
            helpText={t("nombre")}
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
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
            inputSize="sm"
            rounded="lg"
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
              rounded="lg"
              className="mt-2"
              type="number"
              {...register("numberid", {
                onChange: (e) => setSelectedNumberId(e.target.value),
              })}
              tKeyError={t("documentoRequerido")}
              hasError={!!errors.numberid}
              errorMessage={errors.numberid?.message}
            />
            <div className="mt-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("nacimiento")}
                  value={birthDate}
                  onChange={(newDate) => {
                    setBirthDate(newDate);
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
                          backgroundColor: "#e5e7eb", // 🎨 gris claro (bg-gray-200)
                          borderRadius: "9999px", // rounded-md
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none", // quita el borde
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
              defaultOption="Indicativo"
              helpText="Indicativo"
              sizeHelp="xs"
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
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
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
            rounded="lg"
            className="mt-2"
            type="email"
            {...register("email")}
            tKeyError={t("correoRequerido")}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
          {selectedRol === "owner" && (
            <>
              {" "}
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("pet")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Tiene mascota
                  </Text>
                </div>
              </div>
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMainResidence}
                      onChange={(e) =>
                        setSelectedMainResidence(e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Recide en la propiedad
                  </Text>
                </div>
              </div>
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("council")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Pertenece al consejo administrativo
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Columna imagen */}
        <div className="w-full border-x-4  p-2 flex flex-col items-center">
          {!preview && !isCameraOpen && (
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

          {isCameraOpen && (
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
                    onClick={() => setIsCameraOpen(false)}
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

          {preview && (
            <div className="mt-3 gap-5">
              <Image
                src={preview}
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
              options={countryOptions}
              inputSize="sm"
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
              id="city"
              options={cityOptions}
              inputSize="sm"
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
          {selectedRol === "owner" && (
            <>
              <InputField
                placeholder={t("torre")}
                helpText={t("torre")}
                required={true}
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
                required={true}
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedApartment(e.target.value)}
              />
            </>
          )}

          <InputField
            placeholder={t("numeroPlaca")}
            label="Posee vehiculo"
            helpText={t("numeroPlaca")}
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="text"
            onChange={(e) => setSelectedPlaque(e.target.value)}
          />
          <div className="flex items-center mt-3 gap-2">
            <input type="checkbox" {...register("termsConditions")} />
            <button
              type="button"
              onClick={() => {
                router.push(route.termsConditions);
              }}
              className="text-sm text-cyan-600 underline"
            >
              Términos y condiciones aceptados
            </button>
          </div>
          {errors.termsConditions && (
            <Text colVariant="danger" size="xs">
              {errors.termsConditions.message}
            </Text>
          )}
        </div>
      </section>

      {selectedRol === "owner" && (
        <div className="mt-4 border p-2 rounded-md w-full bg-gray-100">
          <Text size="sm" font="bold" className="mt-2" translate="yes">
            Integrantes del hogar
          </Text>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="items-center flex gap-2 mb-2 border-b pb-2"
            >
              <div className="w-full">
                <div className="w-full">
                  <InputField
                    helpText="Nombre completo"
                    className="mt-2"
                    sizeHelp="xs"
                    inputSize="sm"
                    rounded="lg"
                    type="text"
                    {...register(`population.${index}.nameComplet`)}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    helpText="Número de identificación"
                    sizeHelp="xs"
                    inputSize="sm"
                    rounded="lg"
                    className="mt-2"
                    type="text"
                    {...register(`population.${index}.numberId`)}
                  />
                </div>
              </div>
              <div className="w-full">
                <div className="w-full">
                  <Controller
                    control={control}
                    name={`population.${index}.dateBorn`}
                    render={({ field }) => {
                      const dateValue: Date | null =
                        field.value && typeof field.value === "string"
                          ? new Date(field.value)
                          : null;

                      return (
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label={t("nacimiento")}
                            value={dateValue}
                            onChange={(newDate: Date | null) => {
                              field.onChange(
                                newDate
                                  ? newDate.toISOString().split("T")[0]
                                  : null
                              );
                            }}
                            views={["year", "month", "day"]}
                            format="yyyy-MM-dd"
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                error: !!errors.population?.[index]?.dateBorn,
                                helperText:
                                  errors.population?.[index]?.dateBorn
                                    ?.message || "",
                                InputProps: {
                                  sx: {
                                    backgroundColor: "#e5e7eb",
                                    borderRadius: "9999px",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      border: "none",
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      );
                    }}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    helpText="Relación con el propietario"
                    sizeHelp="xs"
                    inputSize="sm"
                    rounded="lg"
                    className="mt-2"
                    type="text"
                    {...register(`population.${index}.relation`)}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                tKey={t("eliminar")}
                colVariant="danger"
                onClick={() => remove(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}

          <Button
            type="button"
            size="sm"
            colVariant="primary"
            onClick={() =>
              append({
                nameComplet: "",
                numberId: "",
                dateBorn: "",
                relation: "",
              })
            }
          >
            Añadir
          </Button>
        </div>
      )}

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
  );
}
