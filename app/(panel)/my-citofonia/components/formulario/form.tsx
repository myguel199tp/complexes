"use client";
import {
  InputField,
  Text,
  Button,
  SelectField,
  Avatar,
} from "complexes-next-components";
import Image from "next/image";
import { IoCamera, IoImages } from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";
import useFormInfo from "./form-info";

export default function Form() {
  const {
    register,
    handleSubmit,
    errors,
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
  } = useFormInfo();

  const onSubmit = (data: any) => {
    console.log("Datos enviados:", data);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center w-full "
      >
        {/* 🧍 Sección izquierda: lista de residentes */}
        <section className="w-full flex flex-col gap-4 md:!flex-row my-8">
          <div className="w-full md:!w-[20%] overflow-y-auto">
            <InputField
              placeholder="Residente"
              helpText="Buscar Residente"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              className="mt-3"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <ul className="space-y-2 mt-2">
              {ListUser.filter((u) =>
                `${u.label} ${u.apto}`
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
              ).map((u) => (
                <li key={u.value}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`relative w-full text-left px-3 py-2 rounded-md transition ${
                      selectedUserId === u.value
                        ? "bg-cyan-8600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <Avatar
                        src={`${BASE_URL}/uploads/${u.imgapt.replace(
                          /^.*[\\/]/,
                          ""
                        )}`}
                        alt={`${u.label}`}
                        size="md"
                        border="thick"
                        shape="round"
                      />
                      <div>
                        <Text size="sm">{u.label}</Text>
                        {u.apto && (
                          <Text size="sm" font="bold">
                            Inmueble: {u.apto}
                          </Text>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 📝 Sección central */}
          <div className="w-full md:!w-[40%] mt-4">
            <SelectField
              className="mt-2"
              helpText={t("tipoVisitante")}
              defaultOption={t("tipoVisitante")}
              options={visitOptions}
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              {...register("visitType")}
              hasError={!!errors.visitType}
              errorMessage={String(errors.visitType?.message)}
            />

            <InputField
              placeholder={t("nombreVisitante")}
              helpText={t("nombreVisitante")}
              className="mt-2"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              {...register("namevisit")}
              hasError={!!errors.namevisit}
              errorMessage={String(errors.namevisit?.message)}
            />

            <InputField
              placeholder={t("numeroIdentificacion")}
              helpText={t("numeroIdentificacion")}
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              className="mt-2"
              type="text"
              {...register("numberId")}
              hasError={!!errors.numberId}
              errorMessage={String(errors.numberId?.message)}
            />

            <InputField type="hidden" {...register("apartment")} />

            <InputField
              placeholder={t("numeroPlaca")}
              helpText={t("numeroPlaca")}
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              className="mt-2"
              type="text"
              {...register("plaque")}
              hasError={!!errors.plaque}
              errorMessage={String(errors.plaque?.message)}
            />
          </div>

          {/* 📷 Sección derecha (foto) */}
          <div className="w-full md:!w-[30%] mt-2 ml-2 flex flex-col justify-center items-center border-x-4 p-2">
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <IoImages
                  size={200}
                  onClick={handleGalleryClick}
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
                  <Text size="sm">{t("tomarFoto")}</Text>
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
                <video ref={videoRef} className="w-80 border rounded-md" />
                <TbLivePhotoFilled
                  onClick={takePhoto}
                  className="mt-4 cursor-pointer text-cyan-800 hover:text-gray-200"
                  size={45}
                />
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
                  width={600}
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
              </div>
            )}
          </div>
        </section>

        <Button
          colVariant="warning"
          size="full"
          rounded="lg"
          type="submit"
          className="mt-4"
        >
          {t("registrarVisitante")}
        </Button>
      </form>
    </div>
  );
}
