"use client";

import React, { useEffect } from "react";
import {
  Modal,
  InputField,
  Buton,
  Text,
  TextAreaField,
  Button,
  Tooltip,
} from "complexes-next-components";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import MyactivityEditForminfo from "./myActivityEditForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  activity: string;
  startHour?: Date;
  endHour?: Date;
  description: string;
  cuantity: number;
}

export default function ModalEdit({
  isOpen,
  onClose,
  id,
  activity,
  startHour,
  endHour,
  description,
  cuantity,
}: Props) {
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
    t,
    language,
  } = MyactivityEditForminfo(id);

  // ✅ Sincronizar horas al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    setStartDate(startHour ?? null);
    setEndDate(endHour ?? null);

    if (startHour) {
      setValue("dateHourStart", startHour.toTimeString().slice(0, 5));
    }

    if (endHour) {
      setValue("dateHourEnd", endHour.toTimeString().slice(0, 5));
    }
  }, [isOpen, startHour, endHour, setStartDate, setEndDate, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("editActividad")}
      className="max-w-5xl w-full"
    >
      <form onSubmit={handleSubmit} key={language} className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 🧾 FORMULARIO */}
          <div className="md:col-span-2 space-y-4">
            <InputField type="hidden" {...register("nameUnit")} />
            <InputField type="hidden" {...register("conjuntoId")} />

            <div>
              <InputField
                placeholder={t("actividadNombre")}
                helpText={t("actividadNombre")}
                sizeHelp="xs"
                regexType="alphanumeric"
                inputSize="sm"
                rounded="md"
                className="mt-2"
                type="text"
                defaultValue={activity}
                {...register("activity")}
                hasError={!!errors.activity}
                errorMessage={errors.activity?.message}
              />
            </div>

            <div>
              <TextAreaField
                placeholder={t("activdadMensje")}
                defaultValue={description}
                regexType="alphanumeric"
                className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputField
                  placeholder={t("actividadCantidad")}
                  helpText={t("actividadCantidad")}
                  sizeHelp="xs"
                  inputSize="sm"
                  regexType="number"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  defaultValue={cuantity}
                  {...register("cuantity")}
                  hasError={!!errors.cuantity}
                  errorMessage={errors.cuantity?.message}
                />
              </div>

              <div>
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
            </div>

            {/* ⏰ HORARIOS */}
            <div>
              <div className="flex gap-4">
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <TimePicker
                    label={t("actividadInicio")}
                    value={startDate}
                    defaultValue={startHour}
                    onChange={(date) => {
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
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                    defaultValue={endHour}
                    onChange={(date) => {
                      if (date && startDate && date <= startDate) return;
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
          </div>

          {/* 📷 IMAGEN */}
          <div className="border rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50">
            {!preview ? (
              <>
                <IoImages
                  size={280}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-200"
                />
                <div className="flex justify-center items-center">
                  <Text colVariant="primary" size="sm" tKey={t("solo")}>
                    solo archivos png - jpg
                  </Text>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3">
                  <Image
                    src={preview}
                    width={600}
                    height={500}
                    alt="Vista previa"
                    className="w-full rounded-md border"
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
                      <Text colVariant="primary" size="md" tKey={t("solo")}>
                        solo archivos png - jpg
                      </Text>
                    </div>
                  </div>
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

            {errors.file && (
              <Text size="xs" colVariant="danger" className="mt-2">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>

        {/* 🔘 ACCIONES */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Buton type="button" borderWidth="none" onClick={onClose}>
            Cancelar
          </Buton>
          <Button type="submit" colVariant="warning">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
