import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import { Button, InputField, Text } from "complexes-next-components";
import { ForumFormValues } from "./use-form";

interface Props {
  pollIndex: number;
  control: Control<ForumFormValues>;
  register: UseFormRegister<ForumFormValues>;
  removePoll: (index: number) => void;
  errors: FieldErrors<ForumFormValues>;
}

export function PollItem({
  pollIndex,
  control,
  register,
  removePoll,
  errors,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `polls.${pollIndex}.options`,
  });

  return (
    <div className="border p-4 rounded-md space-y-2">
      <div className="flex justify-between items-center">
        <Text size="sm" font="bold">
          Encuesta {pollIndex + 1}
        </Text>

        <Button
          type="button"
          size="sm"
          colVariant="danger"
          onClick={() => removePoll(pollIndex)}
        >
          Eliminar
        </Button>
      </div>

      <InputField
        {...register(`polls.${pollIndex}.question` as const)}
        placeholder="Pregunta"
        inputSize="sm"
        rounded="md"
      />
      {errors.polls?.[pollIndex]?.question && (
        <Text colVariant="danger" size="xs">
          {errors.polls[pollIndex]?.question?.message}
        </Text>
      )}

      {fields.map((option, optIndex) => (
        <div key={option.id} className="flex gap-2">
          <InputField
            {...register(
              `polls.${pollIndex}.options.${optIndex}.option` as const
            )}
            placeholder={`Opción ${optIndex + 1}`}
            inputSize="sm"
            rounded="md"
          />
          <Button
            type="button"
            colVariant="danger"
            size="sm"
            onClick={() => remove(optIndex)}
          >
            X
          </Button>
        </div>
      ))}

      <Button type="button" size="sm" onClick={() => append({ option: "" })}>
        Añadir opción
      </Button>
    </div>
  );
}
