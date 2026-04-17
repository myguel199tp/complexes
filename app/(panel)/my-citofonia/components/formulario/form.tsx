"use client";

import {
  InputField,
  Text,
  Button,
  SelectField,
  Avatar,
  Buton,
  Tooltip,
} from "complexes-next-components";
import Image from "next/image";
import { IoCamera, IoImages, IoReturnDownBackOutline } from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";

import useFormInfo from "./form-info";
import useForm from "./use-form";
import { Controller } from "react-hook-form";

export default function Form() {
  const { register, handleSubmit, setValue, control } = useForm();

  const {
    t,
    preview,
    isCameraOpen,
    fileInputRef,
    videoRef,
    canvasRef,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
    visitOptions,
    BASE_URL,
    ListUser,
    filterText,
    setFilterText,
    selectedUserId,
    handleSelectUser,
    language,
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
          <div className="md:w-[40%] flex flex-col gap-2">
            <Controller
              name="visitType"
              control={control}
              render={({ field }) => (
                <SelectField
                  defaultOption="Tipo de visitante"
                  options={visitOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <InputField
              {...register("namevisit")}
              placeholder="Nombre visitante"
            />

            <InputField {...register("numberId")} placeholder="Documento" />

            <InputField {...register("apartment")} placeholder="Apartamento" />

            <InputField {...register("plaque")} placeholder="Placa" />

            {/* 🔹 NUEVO: URL FOTO VISITANTE */}
            <InputField
              {...register("photoUrl")}
              placeholder="URL foto visitante (opcional)"
            />

            {/* 🔹 NUEVO: URL DOCUMENTO */}
            <InputField
              {...register("documentPhotoUrl")}
              placeholder="URL foto documento (opcional)"
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
            />
          </div>

          {/* 🔹 IMAGEN */}
          <div className="w-full md:w-[52%] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6">
            {/* SIN IMAGEN */}
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-3 text-center">
                <IoImages
                  onClick={handleGalleryClick}
                  className="cursor-pointer text-gray-300 w-32 h-32 hover:text-gray-400"
                />

                <Text size="md">Imagen del visitante</Text>
                <Text size="sm" colVariant="primary">
                  Solo PNG o JPG
                </Text>

                <Tooltip content="Tomar foto">
                  <Buton
                    type="button"
                    onClick={openCamera}
                    className="flex items-center gap-2"
                  >
                    <IoCamera size={20} />
                    Tomar foto
                  </Buton>
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
                  className="rounded-md border"
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
        <Button type="submit" colVariant="success" size="full">
          Registrar visitante
        </Button>
      </form>
    </div>
  );
}
