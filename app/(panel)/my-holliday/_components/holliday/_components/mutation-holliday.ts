import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataHolidayServices } from "../../../services/hollidaServices";

export function useMutationHolliday() {
  const api = new DataHolidayServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addHolliday(formData);

      if (response.ok) {
        router.push(route.complexes);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
