import React from "react";
import { Button, Buton, InputField, Text } from "complexes-next-components";
import { useFormForo } from "./use-form";

export default function ForumForm() {
  const {
    register,
    pollsFields,
    optionFieldArrays,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useFormForo();

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <InputField {...register("title")} placeholder="Título" />
        {errors.title && (
          <Text colVariant="danger" size="xs">
            {errors.title.message}
          </Text>
        )}
      </div>

      <div>
        <textarea
          {...register("content")}
          className="bg-gray-200 w-full p-4 rounded-md"
          placeholder="Contenido"
        />
        {errors.content && (
          <Text colVariant="danger" size="xs">
            {errors.content.message}
          </Text>
        )}
      </div>

      <div>
        <InputField {...register("createdBy")} placeholder="Creado por" />
        {errors.createdBy && (
          <Text colVariant="danger" size="xs">
            {errors.createdBy.message}
          </Text>
        )}
      </div>

      {/* Encuestas dinámicas */}
      {pollsFields.map((poll, pollIndex) => {
        const optionsArray = optionFieldArrays[pollIndex];
        return (
          <div key={poll.id} className="border p-4 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <Text font="bold" size="md">
                Encuesta {pollIndex + 1}
              </Text>
            </div>

            <InputField
              {...register(`polls.${pollIndex}.question` as const)}
              placeholder="Pregunta de encuesta"
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
                  placeholder={`Opción ${optIndex + 1}`}
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
              colVariant="default"
              size="sm"
              className="hover:bg-gray-400"
              onClick={() => optionsArray.append({ option: "" })}
            >
              Añadir opción
            </Buton>
          </div>
        );
      })}

      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        Crear hilo
      </Button>
    </form>
  );
}
