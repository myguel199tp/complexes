import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataNewsServices } from "../services/newsSerives";

export function useMutationNewsForm() {
  const api = new DataNewsServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addNews(formData);
      if (response.status === 201) {
        console.log("Response successful");
        router.push(route.complexes);
      }
    },
  });
}
