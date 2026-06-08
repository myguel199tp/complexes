"use client";
import { Button, InputField, TextAreaField } from "complexes-next-components";
import { Controller } from "react-hook-form";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { useCreateMeetingForm } from "./use-create-meeting-form";

interface Props {
  onSuccess?: () => void;
}

export default function CreateMeetingForm({ onSuccess }: Props = {}) {
  const { register, handleSubmit, control, formState, isPending } =
    useCreateMeetingForm(onSuccess);
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl shadow">
      <InputField
        placeholder="Título de la reunión"
        helpText="Título"
        inputSize="sm"
        {...register("title")}
        errorMessage={errors.title?.message}
      />
      <TextAreaField
        rows={3}
        className="bg-gray-200"
        placeholder="Descripción de la reunión..."
        {...register("description")}
        errorMessage={errors.description?.message}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Fecha y hora
              </label>
              <DateTimePicker
                {...field}
                onChange={(date) =>
                  field.onChange(date ? date.toISOString() : null)
                }
                className="bg-gray-200 border-none rounded-md"
                value={field.value ? new Date(field.value) : null}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date?.message,
                  },
                }}
              />
            </div>
          )}
        />
      </LocalizationProvider>
      <Button
        type="submit"
        size="full"
        colVariant="success"
        rounded="md"
        disabled={isPending}
      >
        {isPending ? "Creando..." : "Crear reunión"}
      </Button>
    </form>
  );
}
