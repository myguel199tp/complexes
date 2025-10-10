"use client";
import React from "react";
import { Button, InputField, Text } from "complexes-next-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import useForm from "./use-form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import CustomInput from "./CustomInput";
import MyactivityForminfo from "./myactivity-forminfo";

export default function Form() {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const {
    handleIconClick,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    preview,
    setPreview,
    fileInputRef,
    t,
  } = MyactivityForminfo();

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
  const showAlert = useAlertStore((state) => state.showAlert);

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row my-8">
          <div className="w-full md:!w-[70%]">
            <InputField
              className="mt-2"
              type="hidden"
              {...register("nameUnit")}
              hasError={!!errors.nameUnit}
              errorMessage={errors.nameUnit?.message}
            />
            <InputField type="hidden" {...register("conjunto_id")} />
            <InputField
              placeholder={t("actividadNombre")}
              helpText={t("actividadNombre")}
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("activity")}
              hasError={!!errors.activity}
              errorMessage={errors.activity?.message}
            />
            <textarea
              placeholder={t("activdadMensje")}
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              {...register("description")}
            />
            <InputField
              placeholder={t("actividadCantidad")}
              helpText={t("actividadCantidad")}
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("cuantity")}
              hasError={!!errors.cuantity}
              errorMessage={errors.cuantity?.message}
            />

            {/* ⏰ DatePickers con input bloqueado */}
            <div className="flex flex-col md:!flex-row mt-2 gap-1">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date);
                  setValue(
                    "dateHourStart",
                    date ? date.toTimeString().slice(0, 5) : ""
                  );
                }}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="HH:mm"
                timeCaption="Hora"
                placeholderText={t("actividadInicio")}
                customInput={<CustomInput />}
              />

              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  if (date && startDate && date <= startDate) {
                    showAlert(t("actividadAlerta"), "info");
                    return;
                  }
                  setEndDate(date);
                  setValue(
                    "dateHourEnd",
                    date ? date.toTimeString().slice(0, 5) : ""
                  );
                }}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="HH:mm"
                timeCaption="Hora"
                placeholderText={t("actividadFin")}
                customInput={<CustomInput />}
              />

              <div className="flex md:!justify-center md:!items-center ml-4 mb-4 md:!mb-0">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="checkbox"
                    {...register("status")}
                    className="w-6 h-6 bg-gray-200 border-gray-400 rounded-md cursor-pointer"
                  />
                  <Text
                    size="sm"
                    translate="yes"
                    tKey={t("actividadSeleccion")}
                  >
                    Selecciona si la actividad esta disponible
                  </Text>
                </div>
                {errors.status && (
                  <Text size="xs" colVariant="danger">
                    {errors.status.message}
                  </Text>
                )}
              </div>
            </div>

            <InputField
              placeholder={t("activiadDuracion")}
              helpText={t("activiadDuracion")}
              className="mt-2"
              sizeHelp="xs"
              {...register("duration")}
              hasError={!!errors.duration}
              errorMessage={errors.duration?.message}
            />
          </div>

          {/* 📂 Subida de archivo */}
          <div className="w-full md:!w-[30%] ml-2 justify-center items-center border-x-4 p-2">
            {!preview && (
              <>
                <IoImages
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-100"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm"> solo archivos png - jpg </Text>
                </div>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {preview && (
              <div className="mt-3">
                <Image
                  src={preview}
                  width={200}
                  height={130}
                  alt="Vista previa"
                  className="w-full max-w-xs rounded-md border"
                />
                <Button
                  className="p-2"
                  colVariant="primary"
                  size="sm"
                  onClick={handleIconClick}
                >
                  Cargar otra
                </Button>
              </div>
            )}

            {errors.file && (
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>

        <Button
          colVariant="warning"
          size="full"
          rounded="md"
          type="submit"
          className="mt-4"
        >
          <Text tKey={t("myActividad")} translate="yes">
            Agregar actividad
          </Text>
        </Button>
      </form>
    </div>
  );
}
