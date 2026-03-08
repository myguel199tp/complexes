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
import { useLanguage } from "@/app/hooks/useLanguage";

export default function ForumForm() {
  const {
    register,
    control,
    pollsFields,
    appendPoll,
    removePoll,
    errors,
    onSubmit,
    isSubmitting,
  } = useFormForo();

  const { t } = useTranslation();
  const { language } = useLanguage();
  const showAlert = useAlertStore((state) => state.showAlert);

  const selectedMode = useWatch({
    control,
    name: "mode",
  });

  const startDate = useWatch({
    control,
    name: "startDate",
  });

  return (
    <form key={language} className="mt-4 space-y-4" onSubmit={onSubmit}>
      {/* ========================= */}
      {/* TITULO */}
      {/* ========================= */}

      <InputField
        {...register("title")}
        regexType="alphanumeric"
        placeholder={t("titulo")}
        helpText={t("titulo")}
        inputSize="sm"
        rounded="md"
        errorMessage={errors.title?.message}
      />

      {/* ========================= */}
      {/* FECHAS */}
      {/* ========================= */}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        {/* START DATE */}

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              label={t("fechaInicio")}
              ampm={false}
              minutesStep={5}
              value={field.value ? new Date(field.value) : null}
              onChange={(date) =>
                field.onChange(date ? date.toISOString() : null)
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors.startDate,
                  helperText: errors.startDate?.message,
                },
              }}
            />
          )}
        />

        {/* END DATE */}

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              label={t("fechaFin")}
              ampm={false}
              minutesStep={5}
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => {
                if (date && startDate) {
                  const start = new Date(startDate);

                  if (date <= start) {
                    showAlert(t("actividadAlerta"), "info");
                    return;
                  }
                }

                field.onChange(date ? date.toISOString() : null);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors.endDate,
                  helperText: errors.endDate?.message,
                },
              }}
            />
          )}
        />
      </LocalizationProvider>

      {/* ========================= */}
      {/* TYPE ASSEMBLY */}
      {/* ========================= */}

      <Controller
        name="typeAssembly"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            inputSize="md"
            rounded="md"
            helpText={t("tipoAsamblea")}
            options={Object.values(AssemblyType).map((item) => ({
              label: item,
              value: item,
            }))}
            errorMessage={errors.typeAssembly?.message}
          />
        )}
      />

      {/* ========================= */}
      {/* MODE */}
      {/* ========================= */}

      <Controller
        name="mode"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            inputSize="md"
            rounded="md"
            helpText={t("modoAsamblea")}
            options={Object.values(AssemblyMode).map((item) => ({
              label: item,
              value: item,
            }))}
            errorMessage={errors.mode?.message}
          />
        )}
      />

      {/* ========================= */}
      {/* CAMPOS CONDICIONALES */}
      {/* ========================= */}

      {selectedMode === AssemblyMode.VIRTUAL && (
        <InputField
          {...register("link")}
          placeholder="Link"
          regexType="url"
          inputSize="sm"
          rounded="md"
          errorMessage={errors.link?.message}
        />
      )}

      {selectedMode === AssemblyMode.PRESENCIAL && (
        <InputField
          {...register("address")}
          placeholder="Dirección"
          inputSize="sm"
          rounded="md"
          errorMessage={errors.address?.message}
        />
      )}

      {selectedMode === AssemblyMode.MIXTA && (
        <>
          <InputField
            {...register("link")}
            placeholder="Link"
            regexType="url"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.link?.message}
          />

          <InputField
            {...register("address")}
            placeholder="Dirección"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.address?.message}
          />
        </>
      )}

      {/* ========================= */}
      {/* DESCRIPCION */}
      {/* ========================= */}

      <TextAreaField
        {...register("description")}
        helpText={t("descripcion")}
        className="bg-gray-200"
      />

      {/* ========================= */}
      {/* POLLS */}
      {/* ========================= */}

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
          onClick={() =>
            appendPoll({
              question: "",
              options: [{ option: "" }],
            })
          }
        >
          + {t("agregarEncuesta")}
        </Button>
      </div>

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}

      <Button
        type="submit"
        colVariant="warning"
        size="full"
        className="mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("creando") : t("crearAsamblea")}
      </Button>
    </form>
  );
}
