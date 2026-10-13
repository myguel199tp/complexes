"use client";

import {
  forwardRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { IoDocumentAttachOutline } from "react-icons/io5";
import {
  cn,
  EMAIL_ALLOWED,
  fieldShellClass,
  labelClass,
  resolveRegex,
  roundedClassMap,
  valueTextMap,
  type FieldRounded,
  type FieldSize,
  type HelpSize,
  type RegexType,
} from "./utils";

// Relleno de la caja; el <input> aporta su propio alto de línea
const shellSizeMap: Record<FieldSize, string> = {
  xxs: "px-2.5 py-0.5",
  xs: "px-3 py-0.5",
  sm: "px-4 py-1",
  md: "px-5 py-2",
  lg: "px-6 py-2.5",
  full: "px-6 py-2.5",
};

const inputPaddingMap: Record<FieldSize, string> = {
  xxs: "py-0",
  xs: "py-0.5",
  sm: "py-1",
  md: "py-1.5",
  lg: "py-2",
  full: "py-2",
};

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
  helpText?: string;
  errorMessage?: string;
  rounded?: FieldRounded;
  inputSize?: FieldSize;
  tKeyLabel?: string;
  tKeyHelpText?: string;
  tKeyError?: string;
  tKeyPlaceholder?: string;
  sizeHelp?: HelpSize;
  prefixText?: string;
  prefixImage?: string;
  prefixElement?: ReactNode;
  allowXML?: boolean;
  regexType?: RegexType;
  customRegex?: RegExp;
  onRegexError?: (value: string) => void;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      inputSize = "md",
      rounded = "md",
      disabled,
      placeholder,
      label,
      helpText,
      hasError = false,
      errorMessage = "There was an error",
      tKeyLabel,
      tKeyHelpText,
      tKeyError,
      tKeyPlaceholder,
      type,
      sizeHelp,
      prefixText,
      prefixImage,
      prefixElement,
      allowXML = false,
      regexType,
      customRegex,
      onRegexError,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const { t } = useTranslation();

    if (type === "hidden") {
      return <input ref={ref} type="hidden" onChange={onChange} {...props} />;
    }

    // Bloquea los caracteres que no cumplen la regex mientras se escribe
    const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
      const data = (e.nativeEvent as InputEvent).data;
      if (!data) return;

      const regex =
        regexType === "email"
          ? EMAIL_ALLOWED
          : resolveRegex(regexType, customRegex);

      if (regex && !regex.test(data)) {
        e.preventDefault();
        onRegexError?.(data);
      }
    };

    // Valida el valor completo (solo cuando el consumidor no maneja onChange)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const regex = resolveRegex(regexType, customRegex);
      if (regex && !regex.test(e.target.value)) onRegexError?.(e.target.value);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setFileName(file.name);
    };

    return (
      <div className="w-full">
        {(label || tKeyLabel) && (
          <label htmlFor={props.id} className={labelClass}>
            {tKeyLabel ? t(tKeyLabel) : label}
          </label>
        )}

        <div
          className={cn(
            fieldShellClass({ hasError, disabled }),
            "flex flex-col",
            shellSizeMap[inputSize],
            roundedClassMap[rounded],
            className,
          )}
        >
          {(helpText || tKeyHelpText) && (
            <Text
              id={props.id ? `${props.id}-help` : undefined}
              size={sizeHelp ?? "xxs"}
              colVariant="default"
              className="pt-1 font-semibold text-cyan-800"
            >
              {tKeyHelpText ? t(tKeyHelpText) : helpText}
            </Text>
          )}

          <div className="flex items-center gap-2.5">
            {prefixElement && (
              <div className="flex-shrink-0 text-cyan-600">{prefixElement}</div>
            )}

            {prefixImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prefixImage}
                alt="prefix"
                className="w-7 h-7 object-cover rounded-xl"
              />
            )}

            {prefixText && (
              <div className="text-cyan-700 font-medium">{prefixText}</div>
            )}

            <input
              type={type}
              ref={ref}
              placeholder={tKeyPlaceholder ? t(tKeyPlaceholder) : placeholder}
              className={cn(
                "flex-1 min-w-0 bg-transparent outline-none font-medium text-cyan-950 placeholder:text-cyan-900/40 placeholder:font-normal",
                inputPaddingMap[inputSize],
                valueTextMap[inputSize],
                type === "file" &&
                  "text-cyan-800 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cyan-800 hover:file:bg-cyan-100 file:cursor-pointer",
                disabled && "cursor-not-allowed",
              )}
              disabled={disabled}
              onBeforeInput={handleBeforeInput}
              onChange={
                onChange ?? (type === "file" ? handleFileChange : handleChange)
              }
              accept={allowXML ? ".xml,image/*" : undefined}
              aria-invalid={hasError || undefined}
              {...props}
            />
          </div>

          {fileName && (
            <span className="flex items-center gap-1.5 pb-1 text-xs text-cyan-800">
              <IoDocumentAttachOutline className="flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </span>
          )}
        </div>

        {hasError && (
          <Text size="xs" colVariant="danger" className="mt-1.5 ml-3 font-medium">
            {tKeyError ? t(tKeyError) : errorMessage}
          </Text>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";
