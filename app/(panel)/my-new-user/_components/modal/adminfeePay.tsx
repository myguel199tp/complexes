"use client";

import React from "react";
import { Button, InputField, SelectField } from "complexes-next-components"; // (ajusta según tu lib)
import { useFormPayUser } from "./use-pay-form";
import { useTranslation } from "react-i18next";

export function PayUserForm() {
  const { register, onSubmit, isSubmitting } = useFormPayUser();
  const { t } = useTranslation();

  const months = [
    { label: "Enero", value: "1" },
    { label: "Febrero", value: "2" },
    { label: "Marzo", value: "3" },
    { label: "Abril", value: "4" },
    { label: "Mayo", value: "5" },
    { label: "Junio", value: "6" },
    { label: "Julio", value: "7" },
    { label: "Agosto", value: "8" },
    { label: "Septiembre", value: "9" },
    { label: "Octubre", value: "10" },
    { label: "Noviembre", value: "11" },
    { label: "Diciembre", value: "12" },
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* adminFeeId */}
      {/* month */}
      <SelectField
        helpText="Mes"
        sizeHelp="md"
        defaultOption="Mes"
        {...register("month")}
        options={months}
      />
      <InputField
        sizeHelp="md"
        className="mt-2"
        // tKeyHelpText={t("valorCuota")}
        // tKeyPlaceholder={t("valorCuota")}
        placeholder="Año"
        helpText="Año"
        type="number"
        {...register("year")}
      />

      {/* amount */}
      <InputField
        sizeHelp="md"
        className="mt-2"
        // tKeyHelpText={t("valorCuota")}
        // tKeyPlaceholder={t("valorCuota")}
        placeholder="Monto"
        helpText="Monto"
        type="number"
        {...register("amount")}
      />

      {/* status */}
      <div className="mt-2">
        <SelectField
          helpText={t("estado") || "Estado"}
          {...register("status")}
          options={[
            { label: t("pendiente") || "Pendiente", value: "pending" },
            { label: t("pagado") || "Pagado", value: "paid" },
            { label: t("atrasado") || "Atrasado", value: "late" },
          ]}
        />
      </div>

      {/* Botón enviar */}
      <Button
        className="mt-2"
        type="submit"
        colVariant="warning"
        disabled={isSubmitting}
      >
        Registrar pago
      </Button>
    </form>
  );
}
