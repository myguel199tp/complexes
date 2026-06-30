import React from "react";
import {
  Button,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useFormForo } from "./use-form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function ForumForm() {
  const {
    register,
    pollsFields,
    optionFieldArrays,
    formState: { errors },
    handleSubmit,
  } = useFormForo();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <form
      key={language}
      className="mt-4 space-y-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4"
      onSubmit={handleSubmit}
    >
      <div>
        <InputField
          {...register("title")}
          placeholder={t("titulo")}
          regexType="alphanumeric"
          helpText={t("titulo")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          errorMessage={errors.title?.message}
        />
      </div>

      <div>
        <TextAreaField
          {...register("content")}
          regexType="alphanumeric"
          className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("contenido")}
          errorMessage={errors?.content?.message}
        />
      </div>

      <div>
        <InputField
          {...register("createdBy")}
          placeholder={t("creadopor")}
          helpText={t("creadopor")}
          regexType="alphanumeric"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          errorMessage={errors?.createdBy?.message}
        />
      </div>

      {pollsFields.map((poll, pollIndex) => {
        const optionsArray = optionFieldArrays[pollIndex];
        return (
          <div key={poll.id} className="border border-gray-200 rounded-xl bg-gray-50/40 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <Text font="bold" size="sm">
                {t("encuesta")} {pollIndex + 1}
              </Text>
            </div>

            <InputField
              {...register(`polls.${pollIndex}.question` as const)}
              placeholder={t("pregunta")}
              regexType="alphanumeric"
              helpText={t("pregunta")}
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />

            {errors.polls?.[pollIndex]?.question && (
              <Text colVariant="danger" size="xs">
                {errors.polls[pollIndex]?.question?.message}
              </Text>
            )}

            {optionsArray.fields.map((opt, optIndex) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <InputField
                  {...register(
                    `polls.${pollIndex}.options.${optIndex}.option` as const,
                  )}
                  placeholder={`${t("opcion")} ${optIndex + 1}`}
                  helpText={`${t("opcion")} ${optIndex + 1}`}
                  sizeHelp="xs"
                  regexType="alphanumeric"
                  inputSize="sm"
                  rounded="md"
                />

                <Button
                  type="button"
                  colVariant="danger"
                  size="sm"
                  rounded="lg"
                  onClick={() => optionsArray.remove(optIndex)}
                >
                  X
                </Button>
              </div>
            ))}

            {errors.polls?.[pollIndex]?.options && (
              <Text colVariant="danger" size="xs">
                {errors.polls[pollIndex]?.options?.message}
              </Text>
            )}

            <Button
              type="button"
              tKey={t("agregarOpcion")}
              colVariant="default"
              size="sm"
              className="hover:bg-gray-400"
              onClick={() => optionsArray.append({ option: "" })}
            >
              Añadir opción
            </Button>
          </div>
        );
      })}

      <Button
        type="submit"
        colVariant="success"
        size="full"
        rounded="md"
        className="mt-4 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        tKey={t("crearHilo")}
      >
        Crear encuesta
      </Button>
    </form>
  );
}
