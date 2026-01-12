"use client";

import {
  InputField,
  Text,
  Button,
  SelectField,
  Avatar,
  Buton,
} from "complexes-next-components";
import Image from "next/image";
import { IoCamera, IoImages } from "react-icons/io5";
import { TbLivePhotoFilled } from "react-icons/tb";

import useFormInfo from "./form-info";
import useForm from "./use-form";

export default function Form() {
  const { register, handleSubmit, setValue, errors } = useForm();

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
  } = useFormInfo(setValue);

  return (
    <div key={language} className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <section className="flex flex-col md:flex-row gap-6 my-8">
          {/* IZQUIERDA */}
          <div className="md:w-[20%]">
            <InputField
              placeholder="Buscar residente"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <ul className="mt-2 space-y-2">
              {ListUser.filter((u) =>
                `${u.label} ${u.apto}`
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
              ).map((u) => (
                <li key={u.value}>
                  <Buton
                    type="button"
                    borderWidth="thin"
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
                          ""
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
            <SelectField {...register("visitType")} options={visitOptions} />
            <InputField
              {...register("namevisit")}
              placeholder="Nombre del visitante"
              className="mt-2"
            />
            <InputField
              {...register("numberId")}
              placeholder="Identificación del visitante"
              className="mt-2"
            />
            <InputField
              {...register("plaque")}
              placeholder="placa del vehiculo"
              className="mt-2"
            />
          </div>

          {/* DERECHA */}
          <div className="md:w-[30%] text-center">
            {!preview && !isCameraOpen && (
              <>
                <IoImages
                  size={180}
                  onClick={handleGalleryClick}
                  className="text-gray-300"
                />
                <Button type="button" colVariant="danger" onClick={openCamera}>
                  <IoCamera />
                </Button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />

            {isCameraOpen && (
              <>
                <video ref={videoRef} className="w-full" />
                <TbLivePhotoFilled onClick={takePhoto} size={40} />
                <canvas ref={canvasRef} hidden width={300} height={200} />
              </>
            )}

            {preview && (
              <>
                <Image src={preview} width={300} height={300} alt="preview" />
                {errors.file && (
                  <Text className="text-red-500">{errors.file.message}</Text>
                )}
              </>
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
