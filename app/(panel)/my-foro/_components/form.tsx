import React from "react";
import {
  Button,
  Buton,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useFormForo } from "./use-form";
import { useTranslation } from "react-i18next";

export default function ForumForm() {
  const {
    register,
    pollsFields,
    optionFieldArrays,
    formState: { errors },
    handleSubmit,
  } = useFormForo();
  const { t } = useTranslation();

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <InputField
          {...register("title")}
          placeholder={t("titulo")}
          helpText={t("titulo")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          errorMessage={errors.title?.message}
        />
      </div>

      <div>
        <TextAreaField
          {...register("content")}
          className="bg-gray-200 w-full p-4 rounded-md"
          placeholder={t("contenido")}
          errorMessage={errors?.content?.message}
        />
      </div>

      <div>
        <InputField
          {...register("createdBy")}
          placeholder={t("creadopor")}
          helpText={t("creadopor")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          errorMessage={errors?.createdBy?.message}
        />
      </div>

      {/* Encuestas dinámicas */}
      {pollsFields.map((poll, pollIndex) => {
        const optionsArray = optionFieldArrays[pollIndex];
        return (
          <div key={poll.id} className="border p-4 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <Text font="bold" size="sm">
                {t("encuesta")} {pollIndex + 1}
              </Text>
            </div>

            <InputField
              {...register(`polls.${pollIndex}.question` as const)}
              placeholder={t("pregunta")}
              helpText={t("pregunta")}
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
            />

            {errors.polls?.[pollIndex]?.question && (
              <Text colVariant="danger" size="xs">
                {errors.polls[pollIndex]?.question?.message}
              </Text>
            )}

            {/* Opciones dinámicas */}
            {optionsArray.fields.map((opt, optIndex) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <InputField
                  {...register(
                    `polls.${pollIndex}.options.${optIndex}.option` as const
                  )}
                  placeholder={`${t("opcion")} ${optIndex + 1}`}
                  helpText={`${t("opcion")} ${optIndex + 1}`}
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
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

            <Buton
              type="button"
              tKey={t("agregarOpcion")}
              colVariant="default"
              borderWidth="none"
              size="sm"
              className="hover:bg-gray-400"
              onClick={() => optionsArray.append({ option: "" })}
            >
              Añadir opción
            </Buton>
          </div>
        );
      })}

      <Button
        type="submit"
        colVariant="warning"
        size="full"
        className="mt-4"
        tKey={t("crearHilo")}
      >
        Crear encuesta
      </Button>
    </form>
  );
}
