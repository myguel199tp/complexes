"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoChevronDown, IoClose } from "react-icons/io5";
import {
  cn,
  dropdownClass,
  fieldShellClass,
  labelClass,
  optionClass,
  optionSelectedClass,
  optionSizeClassMap,
  resolveRegex,
  roundedClassMap,
  valueTextMap,
  type FieldRounded,
  type FieldSize,
  type HelpSize,
  type Option,
  type RegexType,
} from "./utils";

const triggerSizeMap: Record<FieldSize, string> = {
  xxs: "px-2.5 py-0.5 min-h-[24px]",
  xs: "px-3 py-1 min-h-[30px]",
  sm: "px-4 py-1.5 min-h-[38px]",
  md: "px-5 py-2.5 min-h-[50px]",
  lg: "px-6 py-3 min-h-[56px]",
  full: "px-6 py-3 min-h-[56px]",
};

const checkboxSizeMap: Record<FieldSize, string> = {
  xxs: "w-3 h-3",
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
  full: "w-5 h-5",
};

// Cuántas opciones seleccionadas se muestran antes de "+N más"
const MAX_VISIBLE = 3;

export interface MultiSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  hasError?: boolean;
  label?: string;
  errorMessage?: string;
  helpText?: string;
  options: Option[];
  defaultOption?: string;
  required?: boolean;
  tkeySearch?: string;
  tKeyLabel?: string;
  tKeyHelpText?: string;
  tKeyError?: string;
  tKeyDefaultOption?: string;
  disabled?: boolean;
  rounded?: FieldRounded;
  inputSize?: FieldSize;
  sizeHelp?: HelpSize;
  searchable?: boolean;
  value?: string[];
  onChange?: (value: string[]) => void;
  prefixElement?: ReactNode;
  prefixImage?: string;
  hidden?: boolean;
  regexType?: RegexType;
  customRegex?: RegExp;
  onRegexError?: (value: string) => void;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  function MultiSelect(
    {
      className,
      inputSize = "md",
      rounded = "md",
      disabled = false,
      label,
      hasError = false,
      errorMessage = "There was an error",
      helpText,
      options,
      defaultOption = "Seleccione opciones",
      required = false,
      tKeyLabel,
      tKeyHelpText,
      tkeySearch,
      tKeyError,
      tKeyDefaultOption,
      sizeHelp,
      hidden,
      id,
      searchable = false,
      value,
      onChange,
      prefixElement,
      prefixImage,
      regexType,
      customRegex,
      onRegexError,
      ...props
    },
    ref,
  ) {
    const { t } = useTranslation();
    const listId = useId();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(value ?? []);
    const [showAll, setShowAll] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    // Cierra al hacer clic fuera o con Escape
    useEffect(() => {
      if (!open) return;
      const onDocClick = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    if (hidden) return <div ref={ref} hidden {...props} />;

    const optionLabel = (opt: Option) =>
      opt.tKeyLabel ? t(opt.tKeyLabel) : opt.label;

    const update = (next: string[]) => {
      setSelected(next);
      onChange?.(next);
    };

    const toggleOption = (val: string) =>
      update(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val],
      );

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const regex = resolveRegex(regexType, customRegex);
      if (regex && !regex.test(val)) {
        onRegexError?.(val);
        return;
      }
      setSearch(val);
    };

    const clearAll = () => {
      setSearch("");
      setShowAll(false);
      update([]);
    };

    const selectedOptions = options.filter((opt) =>
      selected.includes(opt.value),
    );
    const visibleSelected = showAll
      ? selectedOptions
      : selectedOptions.slice(0, MAX_VISIBLE);
    const hiddenCount = selectedOptions.length - MAX_VISIBLE;

    const filteredOptions = searchable
      ? options.filter((opt) =>
          optionLabel(opt).toLowerCase().includes(search.toLowerCase()),
        )
      : options;

    return (
      <div className="relative w-full" ref={containerRef}>
        {(label || tKeyLabel) && (
          <label className={labelClass} htmlFor={id}>
            {tKeyLabel ? t(tKeyLabel) : label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <div
            ref={ref}
            id={id}
            role="combobox"
            aria-controls={listId}
            aria-expanded={open}
            aria-invalid={hasError || undefined}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            {...props}
            className={cn(
              fieldShellClass({ hasError, disabled, active: open }),
              "flex items-center gap-2.5 cursor-pointer outline-none",
              triggerSizeMap[inputSize],
              roundedClassMap[rounded],
              className,
            )}
            onClick={() => !disabled && setOpen((s) => !s)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                if (e.target !== e.currentTarget) return;
                e.preventDefault();
                setOpen((s) => !s);
              }
            }}
          >
            {prefixImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prefixImage}
                alt="prefix"
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            )}
            {prefixElement && (
              <div className="flex-shrink-0 text-cyan-600">{prefixElement}</div>
            )}

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {(helpText || tKeyHelpText) && (
                <Text
                  id={id ? `${id}-help` : undefined}
                  size={sizeHelp ?? "xxs"}
                  colVariant="default"
                  className="font-semibold text-cyan-800"
                >
                  {tKeyHelpText ? t(tKeyHelpText) : helpText}
                </Text>
              )}

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {visibleSelected.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-cyan-800"
                    >
                      <span className="truncate">{optionLabel(opt)}</span>
                      {!disabled && (
                        <button
                          type="button"
                          aria-label={`Quitar ${optionLabel(opt)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOption(opt.value);
                          }}
                          className="flex-shrink-0 rounded-full p-0.5 text-cyan-700 transition-colors hover:bg-cyan-100"
                        >
                          <IoClose className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className="self-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAll((s) => !s);
                      }}
                    >
                      {showAll ? "Ver menos" : `+${hiddenCount} más`}
                    </button>
                  )}
                </div>
              )}

              {open && searchable && (
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder={t(tkeySearch || "Buscar...")}
                  className={cn(
                    "w-full min-w-0 bg-transparent outline-none font-medium text-cyan-950 placeholder:text-cyan-900/40 placeholder:font-normal",
                    valueTextMap[inputSize],
                  )}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              )}

              {selected.length === 0 && !(open && searchable) && (
                <span
                  className={cn("truncate text-cyan-900/40", valueTextMap[inputSize])}
                >
                  {tKeyDefaultOption ? t(tKeyDefaultOption) : defaultOption}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {(selected.length > 0 || search) && !disabled && (
                <button
                  type="button"
                  aria-label="Limpiar"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="rounded-full p-0.5 text-cyan-600/70 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <IoClose />
                </button>
              )}
              <IoChevronDown
                aria-hidden
                className={cn(
                  "text-cyan-600 transition-transform duration-200",
                  open && "rotate-180 text-cyan-700",
                )}
              />
            </div>
          </div>

          {open && !disabled && (
            <ul
              id={listId}
              role="listbox"
              aria-multiselectable
              className={dropdownClass}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(opt.value)}
                      className={cn(
                        optionClass,
                        optionSizeClassMap[inputSize],
                        isSelected && optionSelectedClass,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex flex-shrink-0 items-center justify-center rounded-md border transition-colors",
                          checkboxSizeMap[inputSize],
                          isSelected
                            ? "border-cyan-700 bg-cyan-700 text-white"
                            : "border-cyan-200 bg-white",
                        )}
                      >
                        {isSelected && <IoCheckmark className="w-3/4 h-3/4" />}
                      </span>
                      {opt.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={opt.image}
                          alt={opt.label}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      {opt.icon && (
                        <div className="flex-shrink-0">{opt.icon}</div>
                      )}
                      <span className="truncate">{optionLabel(opt)}</span>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 text-sm text-cyan-900/50">
                  {t("No hay opciones")}
                </li>
              )}
            </ul>
          )}
        </div>

        {hasError && (
          <Text
            id={id ? `${id}-error` : undefined}
            colVariant="danger"
            size="xs"
            className="mt-1.5 ml-3 font-medium"
          >
            {tKeyError ? t(tKeyError) : errorMessage}
          </Text>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
