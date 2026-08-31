"use client";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { format, isValid, parse } from "date-fns";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convierte el valor guardado en el formulario a un Date para el picker.
 * "yyyy-MM-dd" se parsea en hora local para que no se corra un día por zona horaria.
 */
function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = ISO_DATE.test(value)
    ? parse(value, "yyyy-MM-dd", new Date())
    : new Date(value);
  return isValid(parsed) ? parsed : null;
}

interface Props {
  /** Etiqueta que se muestra encima del campo */
  label?: string;
  /** Valor en formato "yyyy-MM-dd" (o ISO completo) */
  value?: string | null;
  /** Devuelve siempre "yyyy-MM-dd", o "" cuando se limpia */
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /**
   * Días que no se pueden elegir, en formato "yyyy-MM-dd". Se comparan como
   * texto contra la fecha local del calendario: convertir a `Date` para
   * compararlas corría un día en zonas horarias al oeste de UTC.
   */
  disabledDates?: string[];
  /** Se aplica al contenedor, no al input */
  className?: string;
  size?: "small" | "medium";
}

export default function DateField({
  label,
  value,
  onChange,
  onBlur,
  name,
  errorMessage,
  required,
  disabled,
  minDate,
  maxDate,
  disabledDates,
  className,
  size = "small",
}: Props) {
  const blocked = disabledDates?.length ? new Set(disabledDates) : null;

  return (
    <div className={`flex flex-col space-y-1 ${className ?? ""}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          value={toDate(value)}
          onChange={(date) =>
            onChange(date && isValid(date) ? format(date, "yyyy-MM-dd") : "")
          }
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          shouldDisableDate={
            blocked
              ? (date) => blocked.has(format(date, "yyyy-MM-dd"))
              : undefined
          }
          format="dd/MM/yyyy"
          className="bg-gray-200 border-none rounded-md"
          slotProps={{
            textField: {
              name,
              onBlur,
              size,
              fullWidth: true,
              error: !!errorMessage,
              helperText: errorMessage,
            },
            field: { clearable: true },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
