"use client";

import {
  forwardRef,
  type ChangeEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import {
  cn,
  fieldShellClass,
  labelClass,
  resolveRegex,
  roundedClassMap,
  valueTextMap,
  type FieldRounded,
  type HelpSize,
  type RegexType,
} from "./utils";

type TextAreaSize = "sm" | "md" | "lg" | "full";

const shellSizeMap: Record<TextAreaSize, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-3",
  lg: "px-6 py-3.5",
  full: "px-5 py-3",
};

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  hasError?: boolean;
  label?: string;
  helpText?: string;
  errorMessage?: string;
  inputSize?: TextAreaSize;
  rounded?: FieldRounded;
  tKeyLabel?: string;
  tKeyHelpText?: string;
  tKeyError?: string;
  tKeyPlaceholder?: string;
  sizeHelp?: HelpSize;
  prefixText?: string;
  prefixImage?: string;
  prefixElement?: ReactNode;
  regexType?: RegexType;
  customRegex?: RegExp;
  onRegexError?: (value: string) => void;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
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
      sizeHelp,
      prefixText,
      prefixImage,
      prefixElement,
      rows = 4,
      regexType,
      customRegex,
      onRegexError,
      onChange,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();

    // Valida el valor completo (solo cuando el consumidor no maneja onChange)
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const regex = resolveRegex(regexType, customRegex);
      if (regex && !regex.test(e.target.value)) onRegexError?.(e.target.value);
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
            "flex flex-col gap-1",
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
              className="font-semibold text-cyan-800"
            >
              {tKeyHelpText ? t(tKeyHelpText) : helpText}
            </Text>
          )}

          <div className="flex items-start gap-2.5">
            {prefixElement && (
              <div className="flex-shrink-0 pt-1 text-cyan-600">
                {prefixElement}
              </div>
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
              <div className="pt-0.5 text-cyan-700 font-medium">
                {prefixText}
              </div>
            )}

            <textarea
              ref={ref}
              placeholder={tKeyPlaceholder ? t(tKeyPlaceholder) : placeholder}
              className={cn(
                "flex-1 min-w-0 w-full resize-none bg-transparent outline-none font-medium leading-relaxed text-cyan-950 placeholder:text-cyan-900/40 placeholder:font-normal",
                valueTextMap[inputSize],
                disabled && "cursor-not-allowed",
              )}
              disabled={disabled}
              rows={rows}
              onChange={onChange ?? handleChange}
              aria-invalid={hasError || undefined}
              {...props}
            />
          </div>
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

TextAreaField.displayName = "TextAreaField";
