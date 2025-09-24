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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";

export default function FormComplex() {
  const router = useRouter();
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedplaque, setSelectedPlaque] = useState("");
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedMainResidence, setSelectedMainResidence] = useState(false);
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
    tower: selectedBlock,
    isMainResidence: selectedMainResidence,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const optionsRol = [
    { value: "owner", label: "Dueño de apartamento" },
    { value: "employee", label: "Portero" },
  ];

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
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
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
                sizeHelp="sm"
                inputSize="full"
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
                  sizeHelp="sm"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="number"
                  {...register("numberid", {
                    onChange: (e) => setSelectedNumberId(e.target.value),
                  })}
                  tKeyError={t("documentoRequerido")}
                  hasError={!!errors.numberid}
                  errorMessage={errors.numberid?.message}
                />
                <DatePicker
                  selected={birthDate}
                  onChange={(date) => {
                    setBirthDate(date);
                    register("bornDate");
                    setValue("bornDate", String(date), {
                      shouldValidate: true,
                    });
                  }}
                  placeholderText={t("nacimiento")}
                  dateFormat="yyyy-MM-dd"
                  className="w-full"
                  isClearable
                  showYearDropdown // 👈 habilita dropdown de años
                  showMonthDropdown // 👈 habilita dropdown de meses
                  scrollableYearDropdown // 👈 permite hacer scroll en los años
                  yearDropdownItemNumber={100} // 👈 cantidad de años visibles en dropdown
                  customInput={
                    <InputField
                      placeholder={t("nacimiento")}
                      helpText={t("nacimiento")}
                      sizeHelp="sm"
                      inputSize="full"
                      rounded="md"
                      className="mt-2"
                      tKeyError={t("nacimientoRequerido")}
                      hasError={!!errors.bornDate}
                      errorMessage={errors.bornDate?.message}
                    />
                  }
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <SelectField
                  tKeyDefaultOption={t("indicativo")}
                  tKeyHelpText={t("indicativo")}
                  searchable
                  defaultOption="Indicativo"
                  helpText="Indicativo"
                  sizeHelp="sm"
                  id="indicative"
                  options={indicativeOptions}
                  inputSize="lg"
                  rounded="md"
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
                  sizeHelp="sm"
                  inputSize="full"
                  rounded="md"
                  type="text"
                  {...register("phone", {
                    required: t("celularRequerido"),
                    pattern: {
                      value: /^[0-9]+$/, // solo números
                      message: t("soloNumeros"), // mensaje de error
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
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                tKeyError={t("correoRequerido")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-md p-4">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="md" translate="yes">
                    Recide en la propiedad
                  </Text>
                </div>
              </div>
            </div>

            {/* Columna imagen */}
            <div className="w-full md:w-[30%] border-x-4  p-2 flex flex-col items-center">
              {!preview && !isCameraOpen && (
                <div className="flex flex-col items-center gap-2">
                  <IoImages
                    size={400}
                    onClick={handleIconClick}
                    className="cursor-pointer text-gray-100"
                  />
                  <Button
                    size="sm"
                    type="button"
                    colVariant="warning"
                    className="flex gap-4 items-center"
                    onClick={openCamera}
                  >
                    <IoCamera className="mr-1" size={30} />
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

            {/* Columna derecha */}
            <div className="w-full md:w-[45%]">
              {/* Campos ocultos */}
              <SelectField
                searchable
                defaultOption={t("seleccionpais")}
                helpText={t("seleccionpais")}
                sizeHelp="sm"
                id="ofert"
                options={countryOptions}
                inputSize="lg"
                rounded="md"
                {...register("country")}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value || null);
                  setValue("country", e.target.value, { shouldValidate: true });
                }}
                tKeyError={t("paisRequerido")}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />
              <div className="w-full mt-2">
                <SelectField
                  searchable
                  defaultOption={t("seleccionaciudad")}
                  helpText={t("seleccionaciudad")}
                  sizeHelp="sm"
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
                  tKeyError={t("ciudadRequerido")}
                  hasError={!!errors.city}
                  errorMessage={errors.city?.message}
                />
              </div>

              <InputField
                placeholder={t("torre")}
                helpText={t("torre")}
                required={true}
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedBlock(e.target.value)}
              />
              <InputField
                placeholder={t("numeroInmuebleResidencial")}
                helpText={t("numeroInmuebleResidencial")}
                required={true}
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                onChange={(e) => setSelectedApartment(e.target.value)}
              />
              <div className="mt-2 w-full">
                <SelectField
                  id="role"
                  defaultOption={t("tipoUsiario")}
                  helpText={t("tipoUsiario")}
                  sizeHelp="sm"
                  value={selectedRol}
                  options={optionsRol}
                  inputSize="full"
                  rounded="md"
                  tKeyError={t("tipoUsiarioRequerido")}
                  hasError={!!errors.role}
                  {...register("role", {
                    onChange: (e) => setSelectedRol(e.target.value),
                  })}
                />
              </div>

              <InputField
                placeholder={t("numeroPlaca")}
                helpText={t("numeroPlaca")}
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
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
