"use client";

import {
  Button,
  Text,
} from "complexes-next-components";
import ExpenseCategoryFormLayout from "./form-category";
import useForm from "./use-form";
import useFormInfo from "./use-formInfo";
import { IoDocumentAttach } from "react-icons/io5";
import { useInfoCategoriesQuery } from "./category-query";
import { Controller } from "react-hook-form";
import { useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { InputField, SelectField, TextAreaField } from "@/app/components/ui/form";
import { usePettyCashQuery } from "./use-petty-cash";

export default function Form() {
  const { register, handleSubmit, control, setValue, watch, formState } =
    useForm();
  const { fileInputRef, preview, setPreview, handleIconClick } = useFormInfo();
  const { errors } = formState;
  const { data: pettyCash } = usePettyCashQuery();
  const usePetty = watch("pettyCash");
  const hasPettyCash = !!pettyCash && pettyCash.assigned > 0;
  const pettyBalance = (pettyCash?.balance ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    } else {
      setPreview(null);
    }
  };

  const [category, setCategory] = useState(false);

  const ChangeCategory = () => {
    setCategory((prev) => !prev);
  };

  const { data } = useInfoCategoriesQuery();

  const CategoryOptions =
    data?.map((property) => ({
      value: `${property.id}`,
      label: `${property.name}`,
    })) || [];
  return (
    <>
      <div className="flex justify-end items-center w-full mt-2 gap-3">
        <Text size="sm" font="bold" colVariant="on">
          Recuerda agregar una categoría primero para poder registrar un gasto
          en ella.
        </Text>

        <Button size="md" colVariant="success" onClick={ChangeCategory}>
          {category && "Volver"}
          {!category && "Agregar categoria"}
        </Button>
      </div>
      {category && <ExpenseCategoryFormLayout />}
      {!category && (
        <div className="flex flex-col lg:flex-row gap-6">
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4"
          >
            <Text
              size="xs"
              font="bold"
              className="text-gray-400 uppercase tracking-wide mb-1"
            >
              Datos del gasto
            </Text>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Registra lo que vas a pagar. Si el conjunto tiene quién apruebe
              gastos, le llega para aprobarlo o rechazarlo. Cuando esté
              aprobado, págalo y márcalo como pagado en «Gastos agregados».
            </p>
            {hasPettyCash && (
              <label className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 cursor-pointer dark:border-cyan-800 dark:bg-cyan-950/40">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("pettyCash")}
                />
                <span className="text-sm text-gray-800 dark:text-gray-100">
                  <span className="font-semibold">
                    Pagado con la caja menor
                  </span>{" "}
                  · disponible {pettyBalance}
                  <span className="block text-xs text-gray-600 dark:text-gray-300">
                    Entra ya pagado y sin pedir aprobación, siempre que quepa en
                    el saldo. Si no cabe, regístralo como gasto normal.
                  </span>
                </span>
              </label>
            )}
            <InputField
              placeholder="Concepto"
              helpText="Concepto"
              sizeHelp="sm"
              regexType="alphanumeric"
              inputSize="sm"
              rounded="md"
              {...register("concept")}
              errorMessage={errors.concept?.message}
            />
            <InputField
              placeholder="Valor"
              helpText="Valor"
              sizeHelp="xs"
              regexType="number"
              inputSize="sm"
              rounded="md"
              type="number"
              {...register("amount")}
              errorMessage={errors.amount?.message}
            />

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="period"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Periodo
                      </label>
                      <DatePicker
                        {...field}
                        views={["year", "month"]}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : null)
                        }
                        value={field.value ? new Date(field.value) : null}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            className:
                              "border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
                            error: !!errors.period,
                            helperText: errors.period?.message,
                          },
                        }}
                      />
                    </div>
                  )}
                />

                {usePetty && (
                  <Controller
                    name="paymentDate"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Fecha del pago
                        </label>
                        <DatePicker
                          {...field}
                          disableFuture
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : null)
                          }
                          value={field.value ? new Date(field.value) : null}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              className:
                                "border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
                              error: !!errors.paymentDate,
                              helperText: errors.paymentDate?.message,
                            },
                          }}
                        />
                      </div>
                    )}
                  />
                )}
              </div>
            </LocalizationProvider>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: "El tipo de categoria es obligatorio" }}
              render={({ field }) => (
                <SelectField
                  searchable
                  defaultOption="Tipo de categoria"
                  helpText="Tipo de categoria"
                  sizeHelp="xs"
                  regexType="alphanumeric"
                  inputSize="md"
                  rounded="lg"
                  options={CategoryOptions}
                  hasError={!!errors.categoryId}
                  errorMessage={errors.categoryId?.message}
                  {...field}
                />
              )}
            />
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <TextAreaField
                rows={3}
                {...register("observations")}
                placeholder="Notas adicionales del gasto..."
                className="mt-2 w-full"
              />
            </div>
            <Button
              type="submit"
              size="full"
              colVariant="success"
              rounded="md"
              className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              {usePetty
                ? "Registrar gasto de caja menor"
                : "Registrar gasto por pagar"}
            </Button>
          </form>

          <div className="w-full lg:w-[450px] bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col items-center">
            <Text as="h3" size="sm" font="semi" className="text-gray-700 mb-3">
              Cotización o factura (PDF, opcional)
            </Text>

            {!preview && (
              <div
                onClick={handleIconClick}
                className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 p-8 cursor-pointer hover:border-cyan-500 transition w-full"
              >
                <IoDocumentAttach
                  size={96}
                  className="cursor-pointer text-gray-400 hover:text-cyan-600 transition"
                />
                <span className="text-sm text-gray-500 mt-2">
                  Subir archivo PDF
                </span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            {preview && (
              <div className="w-full">
                <iframe
                  src={preview}
                  className="w-full h-[500px] border rounded-lg"
                  title="Previsualización PDF"
                />
                <Button
                  className="w-full mt-3"
                  colVariant="primary"
                  size="sm"
                  onClick={handleIconClick}
                >
                  Cambiar PDF
                </Button>
              </div>
            )}

            {errors.file && (
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </div>
      )}
    </>
  );
}
