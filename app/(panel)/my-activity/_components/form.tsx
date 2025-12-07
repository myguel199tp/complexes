"use client";
import React from "react";
import {
  Button,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import MyactivityForminfo from "./myactivity-forminfo";

export default function Form() {
  const {
    handleIconClick,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    preview,
    fileInputRef,
    handleFileChange,
    register,
    setValue,
    handleSubmit,
    errors,
    showAlert,
    t,
  } = MyactivityForminfo();

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full"
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
              regexType="alphanumeric"
              inputSize="sm"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("activity")}
              hasError={!!errors.activity}
              errorMessage={errors.activity?.message}
            />

            <TextAreaField
              placeholder={t("activdadMensje")}
              regexType="alphanumeric"
              className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              {...register("description")}
            />

            <InputField
              placeholder={t("actividadCantidad")}
              helpText={t("actividadCantidad")}
              sizeHelp="xs"
              inputSize="sm"
              regexType="number"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("cuantity")}
              hasError={!!errors.cuantity}
              errorMessage={errors.cuantity?.message}
            />

            {/* 🕒 TimePickers solo para hora */}
            <div className="flex flex-col md:!flex-row mt-2 gap-2 rounded-lg">
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={es}
              >
                {/* Hora de inicio */}
                <TimePicker
                  label={t("actividadInicio")}
                  value={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date);
                    setValue(
                      "dateHourStart",
                      date ? date.toTimeString().slice(0, 5) : ""
                    );
                  }}
                  ampm={false}
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors?.dateHourStart,
                      helperText: errors?.dateHourStart?.message || "",
                      InputProps: {
                        sx: {
                          backgroundColor: "#e5e7eb",
                          borderRadius: "0.375rem",
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

                {/* Hora de fin */}
                <TimePicker
                  label={t("actividadFin")}
                  value={endDate}
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
                  ampm={false}
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors?.dateHourEnd,
                      helperText: errors?.dateHourEnd?.message || "",
                      InputProps: {
                        sx: {
                          backgroundColor: "#e5e7eb",
                          borderRadius: "0.375rem",
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

            {/* ⏱ Duración */}
            <InputField
              placeholder={t("activiadDuracion")}
              helpText={t("activiadDuracion")}
              className="mt-2"
              sizeHelp="xs"
              inputSize="sm"
              regexType="number"
              rounded="md"
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
                  <Text size="sm" tKey={t("solo")}>
                    solo archivos png - jpg
                  </Text>
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
