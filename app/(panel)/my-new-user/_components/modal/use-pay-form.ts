import { useMutationFeePayUser } from "../use-fee-pay-mutation";
import { useUiStore } from "./store/new-store";

export function useFormPayMentUser() {
  const mutation = useMutationFeePayUser();
  const { textValue } = useUiStore();

  const onSubmit = async () => {
    if (!textValue) return;
    await mutation.mutateAsync(textValue);
  };

  return {
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}
