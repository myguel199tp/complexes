"use client";

import {
  InputField,
  Text,
  Button,
  SelectField,
  Avatar,
  Tooltip,
} from "complexes-next-components";
import Image from "next/image";
import { IoCamera, IoImages, IoReturnDownBackOutline } from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";

import useFormInfo from "./form-info";
import useForm from "./use-form";
import { Controller } from "react-hook-form";

export default function Form() {
  const { register, handleSubmit, setValue, control, errors } = useForm();

  const {
    t,
    preview,
    isCameraOpen,
    fileInputRef,
    videoRef,
    canvasRef,
    visitOptions,
    BASE_URL,
    ListUser,
    filterText,
    selectedUserId,
    language,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
    setFilterText,
    handleSelectUser,
    setIsCameraOpen,
  } = useFormInfo(setValue);

  return (
    <div key={language} className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <section className="flex flex-col md:flex-row gap-6 my-8">
          {/* 🔹 LISTA USUARIOS */}
          <div className="md:w-[20%]">
            <InputField
              tKeyHelpText={t("buscarNoticia")}
              helpText="Buscar"
              placeholder="Buscar ..."
              value={filterText}
              inputSize="sm"
              onChange={(e) => setFilterText(e.target.value)}
            />

            <ul className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {ListUser.filter((u) =>
                `${u.label} ${u.apto}`
                  .toLowerCase()
                  .includes(filterText.toLowerCase()),
              ).map((u) => (
                <li key={u.value}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition
                    ${
                      selectedUserId === u.value
                        ? "bg-cyan-700 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Avatar
                      src={`${BASE_URL}/uploads/${u?.imgapt?.replace(
                        /^.*[\\/]/,
                        "",
                      )}`}
                      alt={u.label}
                      size="md"
                      border="thick"
                      shape="round"
                    />

                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">{u.label}</span>
                      <span className="text-xs opacity-70">
                        Torre {u.tower ?? "-"} • Apto {u.apto ?? "-"}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 🔹 FORM */}
          <div className="md:w-[40%] flex flex-col gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <Text size="xs" font="bold" className="text-gray-400 uppercase tracking-wide mb-1">
              Datos del visitante
            </Text>
            <Controller
              name="visitType"
              control={control}
              render={({ field }) => (
                <SelectField
                  helpText="Tipo de visitante"
                  defaultOption="Tipo de visitante"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="lg"
                  options={visitOptions}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.visitType}
                  errorMessage={errors.visitType?.message}
                />
              )}
            />

            <InputField
              {...register("namevisit")}
              placeholder="Nombre visitante"
              helpText="Nombre visitante"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />

            <InputField
              {...register("numberId")}
              placeholder="Documento"
              helpText="Documento"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />

            <InputField
              {...register("apartment")}
              placeholder="Apartamento"
              helpText="Apartamento"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.apartment}
              errorMessage={errors.apartment?.message}
            />

            <InputField
              {...register("plaque")}
              placeholder="Placa"
              helpText="Placa"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              hasError={!!errors.plaque}
              errorMessage={errors.plaque?.message}
            />

            {/* 🔹 NUEVO: URL FOTO VISITANTE */}
            <InputField
              {...register("photoUrl")}
              placeholder="URL foto visitante (opcional)"
              helpText="URL foto visitante"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />

            {/* 🔹 NUEVO: URL DOCUMENTO */}
            <InputField
              {...register("documentPhotoUrl")}
              placeholder="URL foto documento (opcional)"
              helpText="URL foto documento"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />

            {/* 🔹 PARKING */}
            <Controller
              name="hasParking"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>Cobra parqueadero</span>
                </label>
              )}
            />

            <InputField
              {...register("parkingRatePerHour")}
              placeholder="Valor por hora (ej: 2000)"
              helpText="Valor por hora"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />
          </div>

          {/* 🔹 IMAGEN */}
          <div className="w-full md:w-[52%] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 transition hover:border-cyan-500">
            {/* SIN IMAGEN */}
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-3 text-center">
                <IoImages
                  onClick={handleGalleryClick}
                  className="cursor-pointer text-gray-400 hover:text-cyan-600 transition w-24 h-24"
                />

                <Text size="md">Imagen del visitante</Text>
                <Text size="sm" colVariant="primary">
                  Solo PNG o JPG
                </Text>

                <Tooltip content="Tomar foto" className="bg-gray-200">
                  <Button
                    type="button"
                    colVariant="success"
                    onClick={openCamera}
                    size="sm"
                  >
                    <IoCamera size={20} />
                  </Button>
                </Tooltip>
              </div>
            )}

            {/* INPUT FILE */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />

            {/* CAMARA */}
            {isCameraOpen && (
              <div className="flex flex-col items-center w-full">
                <video
                  ref={videoRef}
                  className="w-full max-w-md rounded-md border"
                />

                <div className="flex gap-10 mt-4">
                  <TbLivePhotoFilled
                    size={40}
                    className="cursor-pointer text-cyan-600"
                    onClick={takePhoto}
                  />

                  <IoReturnDownBackOutline
                    size={35}
                    className="cursor-pointer text-gray-500"
                    onClick={() => setIsCameraOpen(false)}
                  />
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* PREVIEW */}
            {preview && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <Image
                  src={preview}
                  width={400}
                  height={300}
                  alt="preview"
                  className="w-full rounded-xl shadow-md border border-gray-200"
                />

                <div className="flex gap-2">
                  <Button type="button" onClick={openCamera}>
                    Tomar otra
                  </Button>
                  <Button type="button" onClick={handleGalleryClick}>
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 🔹 SUBMIT */}
        <Button
          type="submit"
          colVariant="success"
          size="full"
          rounded="md"
          className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          Registrar visitante
        </Button>
      </form>
    </div>
  );
}
