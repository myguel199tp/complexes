import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataForoServices } from "../services/myForoServices";
import { ForumPayload } from "./cosntants";

export function useMutationForo() {
  const api = new DataForoServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: ForumPayload) => {
      const response = await api.addForo(formData);

      if (response.ok) {
        router.push(route.complexes);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
