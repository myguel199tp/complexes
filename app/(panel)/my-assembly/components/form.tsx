"use client";

import React from "react";
import {
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import { useFormForo } from "./use-form";
import { useTranslation } from "react-i18next";
import {
  AssemblyMode,
  AssemblyType,
} from "../services/request/assemblyRequest";
import { PollItem } from "./PollItem";
import { Controller, useWatch } from "react-hook-form";

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export default function ForumForm() {
  const {
    register,
    pollsFields,
    appendPoll,
    removePoll,
    errors,
    control,
    onSubmit,
  } = useFormForo();
  const { t } = useTranslation();
  const showAlert = useAlertStore((state) => state.showAlert);

  // Observa el valor de "mode"
  const selectedMode = useWatch({ control, name: "mode" });

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      <InputField
        {...register("title")}
        placeholder={t("titulo")}
        helpText={t("titulo")}
        inputSize="sm"
        rounded="lg"
        errorMessage={errors.title?.message}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        {/* Fecha y hora de inicio */}
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              {...field}
              label="Hora y fecha de inicio de la asamblea"
              ampm={false}
              minutesStep={5}
              onChange={(date) =>
                field.onChange(date ? date.toISOString() : null)
              }
              value={field.value ? new Date(field.value) : null}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors?.startDate,
                  helperText: errors?.startDate?.message || "",
                  InputProps: {
                    sx: {
                      backgroundColor: "#e5e7eb",
                      borderRadius: "0.375rem",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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
          )}
        />

        {/* Fecha y hora de fin */}
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              {...field}
              label="Hora y fecha de finalización de la asamblea"
              ampm={false}
              minutesStep={5}
              onChange={(date) => {
                const start = control._formValues.dateHourStart
                  ? new Date(control._formValues.dateHourStart)
                  : null;

                if (date && start && date <= start) {
                  showAlert(t("actividadAlerta"), "info");
                  return;
                }

                field.onChange(date ? date.toISOString() : null);
              }}
              value={field.value ? new Date(field.value) : null}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors?.endDate,
                  helperText: errors?.endDate?.message || "",
                  InputProps: {
                    sx: {
                      backgroundColor: "#e5e7eb",
                      borderRadius: "0.375rem",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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
          )}
        />
      </LocalizationProvider>

      <Controller
        name="typeAssembly"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            inputSize="sm"
            rounded="lg"
            helpText="tipo de asamblea"
            options={Object.values(AssemblyType).map((item) => ({
              label: item,
              value: item,
            }))}
            errorMessage={errors.typeAssembly?.message}
          />
        )}
      />

      <Controller
        name="mode"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            inputSize="sm"
            rounded="lg"
            helpText="modo de asamblea"
            options={Object.values(AssemblyMode).map((item) => ({
              label: item,
              value: item,
            }))}
            errorMessage={errors.mode?.message}
          />
        )}
      />

      {/* Campos condicionales según mode */}
      {selectedMode === AssemblyMode.VIRTUAL && (
        <InputField
          {...register("link")}
          placeholder="Link"
          inputSize="sm"
          rounded="lg"
          errorMessage={errors.link?.message}
        />
      )}

      {selectedMode === AssemblyMode.PRESENCIAL && (
        <InputField
          {...register("address")}
          placeholder="Dirección"
          inputSize="sm"
          rounded="lg"
          errorMessage={errors.address?.message}
        />
      )}

      {selectedMode === AssemblyMode.MIXTA && (
        <>
          <InputField
            {...register("link")}
            placeholder="Link"
            inputSize="sm"
            rounded="lg"
            errorMessage={errors.link?.message}
          />
          <InputField
            {...register("address")}
            placeholder="Dirección"
            inputSize="sm"
            rounded="lg"
            errorMessage={errors.address?.message}
          />
        </>
      )}

      <TextAreaField
        {...register("description")}
        helpText={t("descripcion")}
        className="bg-gray-200"
      />

      <div className="space-y-6">
        {pollsFields.map((poll, pollIndex) => (
          <PollItem
            key={poll.id}
            pollIndex={pollIndex}
            register={register}
            control={control}
            removePoll={removePoll}
            errors={errors}
          />
        ))}

        <Button
          type="button"
          size="sm"
          className="mt-2"
          onClick={() =>
            appendPoll({ question: "", options: [{ option: "" }] })
          }
        >
          + {t("agregarEncuesta")}
        </Button>
      </div>

      <Button type="submit" colVariant="warning" size="full" className="mt-4">
        Crear Asamblea
      </Button>
    </form>
  );
}
