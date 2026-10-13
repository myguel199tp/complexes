"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
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

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  label?: string;
  errorMessage?: string;
  helpText?: string;
  tkeySearch?: string;
  options: Option[];
  defaultOption?: string;
  required?: boolean;
  tKeyLabel?: string;
  tKeyHelpText?: string;
  tKeyError?: string;
  tKeyDefaultOption?: string;
  sizeHelp?: HelpSize;
  searchable?: boolean;
  inputSize?: FieldSize;
  rounded?: FieldRounded;
  prefixElement?: ReactNode;
  prefixImage?: string;
  regexType?: RegexType;
  customRegex?: RegExp;
  onRegexError?: (value: string) => void;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      inputSize = "md",
      rounded = "md",
      disabled,
      label,
      hasError = false,
      errorMessage = "There was an error",
      helpText,
      options,
      defaultOption = "Seleccione una opción",
      required = false,
      tKeyLabel,
      tKeyHelpText,
      tKeyError,
      tKeyDefaultOption,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tkeySearch: _tkeySearch,
      sizeHelp,
      hidden,
      searchable = false,
      prefixElement,
      prefixImage,
      id,
      name,
      onChange,
      value,
      defaultValue,
      regexType,
      customRegex,
      onRegexError,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const listId = useId();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string>(
      (typeof value === "string" && value) ||
        (typeof defaultValue === "string" && defaultValue) ||
        "",
    );

    useEffect(() => {
      if (typeof value === "string") setSelected(value);
    }, [value]);

    // Cierra al hacer clic fuera o con Escape
    useEffect(() => {
      if (!isOpen) return;
      const onDocClick = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [isOpen]);

    if (hidden) return <select ref={ref} hidden name={name} {...props} />;

    const optionLabel = (opt: Option) =>
      opt.tKeyLabel ? t(opt.tKeyLabel) : opt.label;

    const filteredOptions = searchable
      ? options.filter((opt) =>
          optionLabel(opt).toLowerCase().includes(search.toLowerCase()),
        )
      : options;

    // El consumidor espera un evento de <select>; solo se usa target.value/name
    const emitNativeChange = (val: string) => {
      onChange?.({
        target: { value: val, name },
        currentTarget: { value: val, name },
      } as unknown as ChangeEvent<HTMLSelectElement>);
    };

    const handleSelect = (valueSelected: string) => {
      const opt = options.find((o) => o.value === valueSelected);
      setSelected(valueSelected);
      setSearch(opt ? optionLabel(opt) : "");
      setIsOpen(false);
      emitNativeChange(valueSelected);
    };

    const clear = () => {
      setSearch("");
      setSelected("");
      emitNativeChange("");
    };

    const selectedOption = options.find((o) => o.value === selected);
    const placeholderText = tKeyDefaultOption
      ? t(tKeyDefaultOption)
      : defaultOption;
    const helpContent = (helpText || tKeyHelpText) && (
      <Text
        id={id ? `${id}-help` : undefined}
        size={sizeHelp ?? "xxs"}
        colVariant="default"
        className="font-semibold text-cyan-800"
      >
        {tKeyHelpText ? t(tKeyHelpText) : helpText}
      </Text>
    );
    const listOptions = search.trim() === "" ? options : filteredOptions;

    const shell = cn(
      fieldShellClass({ hasError, disabled, active: isOpen }),
      "flex items-center gap-2.5 text-left",
      triggerSizeMap[inputSize],
      roundedClassMap[rounded],
    );

    const chevron = (
      <IoChevronDown
        aria-hidden
        className={cn(
          "flex-shrink-0 text-cyan-600 transition-transform duration-200",
          isOpen && "rotate-180 text-cyan-700",
        )}
      />
    );

    const prefix = (
      <>
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
      </>
    );

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {(label || tKeyLabel) && (
          <label className={labelClass} htmlFor={id}>
            {tKeyLabel ? t(tKeyLabel) : label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className="relative w-full">
          {searchable ? (
            <div className={shell}>
              {prefix}
              <div className="flex-1 min-w-0">
                {helpContent}
                <input
                  id={id}
                  type="text"
                  role="combobox"
                  aria-controls={listId}
                  aria-expanded={isOpen}
                  aria-invalid={hasError || undefined}
                  value={search}
                  disabled={disabled}
                  onClick={() => !disabled && setIsOpen(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    const regex = resolveRegex(regexType, customRegex);
                    if (regex && !regex.test(val)) {
                      onRegexError?.(val);
                      return;
                    }

                    setSearch(val);

                    // Si queda vacío se limpia la selección y se cierra
                    if (val.trim() === "") {
                      setIsOpen(false);
                      setSelected("");
                      emitNativeChange("");
                      return;
                    }

                    setIsOpen(true);
                  }}
                  placeholder={placeholderText}
                  className={cn(
                    "w-full min-w-0 bg-transparent outline-none font-medium text-cyan-950 placeholder:text-cyan-900/40 placeholder:font-normal",
                    valueTextMap[inputSize],
                    disabled && "cursor-not-allowed",
                  )}
                />
              </div>

              {search && !disabled && (
                <button
                  type="button"
                  aria-label="Limpiar"
                  onClick={clear}
                  className="flex-shrink-0 rounded-full p-0.5 text-cyan-600/70 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <IoClose />
                </button>
              )}
              {chevron}
            </div>
          ) : (
            <button
              id={id}
              type="button"
              aria-haspopup="listbox"
              aria-controls={listId}
              aria-expanded={isOpen}
              disabled={disabled}
              onClick={() => !disabled && setIsOpen((s) => !s)}
              className={cn(shell, "outline-none")}
            >
              {prefix}
              <div className="flex-1 min-w-0">
                {helpContent}
                {selectedOption ? (
                  <div className="flex items-center gap-2 w-full">
                    {selectedOption.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedOption.image}
                        alt={selectedOption.label}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    {selectedOption.icon && (
                      <div className="flex-shrink-0">{selectedOption.icon}</div>
                    )}
                    <span
                      className={cn(
                        "block truncate font-medium text-cyan-950",
                        valueTextMap[inputSize],
                      )}
                    >
                      {optionLabel(selectedOption)}
                    </span>
                  </div>
                ) : (
                  <span
                    className={cn(
                      "block truncate text-cyan-900/40",
                      valueTextMap[inputSize],
                    )}
                  >
                    {placeholderText}
                  </span>
                )}
              </div>
              {chevron}
            </button>
          )}

          {isOpen && !disabled && (
            <ul
              id={listId}
              role="listbox"
              aria-activedescendant={selected}
              className={dropdownClass}
            >
              {listOptions.map((opt) => {
                const isSelected = opt.value === selected;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      optionClass,
                      optionSizeClassMap[inputSize],
                      isSelected && optionSelectedClass,
                    )}
                  >
                    {opt.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={opt.image}
                        alt={opt.label}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {opt.icon && <div className="flex-shrink-0">{opt.icon}</div>}
                    <span className="flex-1 truncate">{optionLabel(opt)}</span>
                    {isSelected && (
                      <IoCheckmark className="flex-shrink-0 text-cyan-700" />
                    )}
                  </li>
                );
              })}

              {listOptions.length === 0 && (
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

SelectField.displayName = "SelectField";
