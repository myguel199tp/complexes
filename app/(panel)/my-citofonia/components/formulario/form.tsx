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

export default function Form() {
  const { register, handleSubmit, setValue } = useForm();

  const {
    t,
    visitOptions,
    preview,
    isCameraOpen,
    fileInputRef,
    videoRef,
    canvasRef,
    handleGalleryClick,
    handleFileChange,
    openCamera,
    takePhoto,
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
          {/* IZQUIERDA */}
          <div className="md:w-[20%]">
            <InputField
              tKeyHelpText={t("buscarNoticia")}
              helpText="Buscar"
              inputSize="sm"
              tKeyPlaceholder={t("buscarNoticia")}
              placeholder="Buscar ..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <ul className="mt-4 space-y-2">
              {ListUser.filter((u) =>
                `${u.label} ${u.apto}`
                  .toLowerCase()
                  .includes(filterText.toLowerCase()),
              ).map((u) => (
                <li key={u.value}>
                  <Buton
                    type="button"
                    borderWidth="none"
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-2 rounded ${
                      selectedUserId === u.value
                        ? "bg-cyan-800 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
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
                      <div>
                        <Text>{u.label}</Text>
                        <Text size="sm">Inmueble: {u.apto}</Text>
                      </div>
                    </div>
                  </Buton>
                </li>
              ))}
            </ul>
          </div>

          {/* CENTRO */}
          <div className="md:w-[40%]">
            <SelectField
              helpText={t("tipovisitante")}
              {...register("visitType")}
              options={visitOptions}
            />
            <InputField
              {...register("namevisit")}
              tKeyPlaceholder={t("nombreVisitante")}
              helpText="Nombre del visitante"
              tKeyHelpText={t("nombreVisitante")}
              placeholder="Nombre del visitante"
              className="mt-2"
            />
            <InputField
              {...register("numberId")}
              tKeyPlaceholder={t("nuemroIdentificacion")}
              helpText="Número de identificación"
              tKeyHelpText={t("nuemroIdentificacion")}
              placeholder="Número de identificación"
              className="mt-2"
            />
            <InputField
              {...register("plaque")}
              tKeyPlaceholder={t("numeroPlaca")}
              helpText="Número de la placa"
              tKeyHelpText={t("numeroPlaca")}
              placeholder="Número de la placa"
              className="mt-2"
            />
          </div>

          {/* DERECHA */}
          <div className="md:w-[30%] text-center">
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <IoImages
                  onClick={handleGalleryClick}
                  className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
                />
                <div className="justify-center items-center">
                  <Text colVariant="primary" size="sm" tKey={t("solo")}>
                    solo archivos png - jpg
                  </Text>
                </div>
                <Tooltip
                  content="Tomar foto"
                  tKey={t("tomarFoto")}
                  position="left"
                  className="bg-gray-200"
                >
                  <Buton
                    size="sm"
                    type="button"
                    borderWidth="none"
                    colVariant="warning"
                    className="flex gap-4 items-center"
                    onClick={openCamera}
                  >
                    <IoCamera className="mr-1" size={30} />
                  </Buton>
                </Tooltip>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* {isCameraOpen && (
              <>
                <video ref={videoRef} className="w-full" />
                <TbLivePhotoFilled onClick={takePhoto} size={40} />
                <canvas ref={canvasRef} hidden width={300} height={200} />
              </>
            )} */}
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
                    <div className="bg-white/20 p-2 rounded-full cursor-pointer">
                      <IoReturnDownBackOutline
                        size={30}
                        color="white"
                        className="cursor-pointer"
                        onClick={() => setIsCameraOpen(false)}
                      />
                    </div>
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
              <div className="mt-3">
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
                  colVariant="warning"
                  onClick={handleGalleryClick}
                >
                  Cambiar foto
                </Button>
              </div>
            )}
          </div>
        </section>

        <Button type="submit" colVariant="warning" size="full">
          {t("registrarVisitante")}
        </Button>
      </form>
    </div>
  );
}
