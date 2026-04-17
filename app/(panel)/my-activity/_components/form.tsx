"use client";
import React, { useEffect } from "react";
import {
  Button,
  InputField,
  SelectField,
  Text,
  TextAreaField,
  Tooltip,
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
    startDate,
    endDate,
    preview,
    fileInputRef,
    errors,
    setStartDate,
    setEndDate,
    handleIconClick,
    handleFileChange,
    register,
    setValue,
    handleSubmit,
    showAlert,
    t,
    typeOptions,
    watch,
  } = MyactivityForminfo();

  const type = watch("type");

  useEffect(() => {
    if (type === "FULL_DAY") {
      const start = new Date();
      start.setHours(0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 0);

      setStartDate(start);
      setEndDate(end);

      setValue("duration", 1440);
      setValue("dateHourStart", "00:00");
      setValue("dateHourEnd", "23:59");
    }
  }, [setEndDate, setStartDate, setValue, type]);

  return (
    <div className="w-full mt-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full"
      >
        <section className="w-full flex flex-col md:!flex-row gap-2 ">
          <div className="w-full md:!w-[70%]">
            <InputField type="hidden" {...register("conjuntoId")} />

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
              rows={8}
              maxLength={450}
              {...register("description")}
              errorMessage={errors.description?.message}
            />
            <Text
              tKey={t("minimunPlus")}
              size="xs"
              className="text-right text-gray-500"
            >
              Minimo 10 - Máximo 450 caracteres
            </Text>

            <SelectField
              inputSize="md"
              rounded="md"
              helpText="Tipo de reserva"
              options={typeOptions}
              defaultOption="Tipo de reserva"
              {...register("type")}
              onChange={(e) =>
                setValue("type", e.target.value, { shouldValidate: true })
              }
              hasError={!!errors.type}
              errorMessage={errors.type?.message}
            />

            <InputField
              placeholder="Precio"
              helpText="Precio de la actividad"
              sizeHelp="xs"
              inputSize="sm"
              regexType="number"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("price")}
              hasError={!!errors.price}
              errorMessage={errors.price?.message}
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

            {type !== "FULL_DAY" && (
              <>
                <div className="flex flex-col md:!flex-row mt-2 gap-2 rounded-lg">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <TimePicker
                      label={t("actividadInicio")}
                      value={startDate}
                      onChange={(date: Date | null) => {
                        setStartDate(date);
                        setValue(
                          "dateHourStart",
                          date ? date.toTimeString().slice(0, 5) : "",
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
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                            },
                          },
                        },
                      }}
                    />

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
                          date ? date.toTimeString().slice(0, 5) : "",
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
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

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
              </>
            )}
          </div>

          <div
            onClick={handleIconClick}
            className="w-full cursor-pointer md:w-[52%] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 transition hover:border-cyan-500"
          >
            {!preview && (
              <>
                <IoImages className="cursor-pointer text-gray-400 hover:text-cyan-600 transition w-24 h-24" />
                <div className="justify-center items-center">
                  <Text size="md">Imagen de la actividad</Text>
                  <Text colVariant="primary" size="md" tKey={t("solo")}>
                    solo archivos png - jpg
                  </Text>
                </div>
              </>
            )}

            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {preview && (
              <div className="mt-3">
                <Image
                  src={preview}
                  width={600}
                  height={500}
                  alt="Vista previa"
                  className="w-full rounded-xl shadow-md border border-gray-200"
                />
                <div className="flex gap-6">
                  <Tooltip
                    content="Cargar otra"
                    position="right"
                    className="bg-gray-200 w-28"
                    tKey={t("cargarOtra")}
                  >
                    <IoImages
                      size={60}
                      onClick={handleIconClick}
                      className="cursor-pointer text-gray-200 hover:text-cyan-800"
                    />
                  </Tooltip>
                  <div className="justify-center items-center">
                    <Text size="md">Imagen de la actividad</Text>
                    <Text colVariant="primary" size="md" tKey={t("solo")}>
                      solo archivos png - jpg
                    </Text>
                  </div>
                </div>
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
          colVariant="success"
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
