"use client";

import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
  TextAreaField,
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

export default function Form() {
  const { register, handleSubmit, control, setValue, formState } = useForm();
  const { fileInputRef, preview, setPreview, handleIconClick } = useFormInfo();
  const { errors } = formState;
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
      <div className="flex justify-end items-end w-full mt-2 gap-3">
        <Text>
          Recuerda agregar una categoría primero para poder registrar un gasto
          en ella.
        </Text>

        <Buton
          size="md"
          borderWidth="none"
          colVariant="warning"
          onClick={ChangeCategory}
        >
          Agregar categoría
        </Buton>
      </div>
      {category && <ExpenseCategoryFormLayout />}
      {!category && (
        <div className="flex flex-col lg:flex-row gap-6">
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-4 bg-white p-6 rounded-xl shadow"
          >
            <InputField
              placeholder="Concepto"
              helpText="Concepto"
              inputSize="sm"
              {...register("concept")}
              errorMessage={errors.concept?.message}
            />
            <InputField
              placeholder="Valor"
              helpText="Valor"
              inputSize="sm"
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
                  name="paymentDate"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Fecha de pago
                      </label>
                      <DatePicker
                        {...field}
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
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-gray-200"
              />
            </div>
            <Button type="submit" size="full" colVariant="warning" rounded="md">
              Guardar gasto
            </Button>
          </form>

          <div className="w-full lg:w-[450px] bg-white p-4 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Factura (PDF)
            </h3>

            {!preview && (
              <div
                onClick={handleIconClick}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition w-full"
              >
                <IoDocumentAttach size={120} className="text-gray-300" />
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
