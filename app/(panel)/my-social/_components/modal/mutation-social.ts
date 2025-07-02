import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataMysocialServices } from "../../services/mySocialServices";
import { SocialRequest } from "../../services/request/socialRequest";

export function useMutationSocial() {
  const api = new DataMysocialServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SocialRequest) => {
      const response = await api.registerSocialService(data);
      if (response.ok) {
        router.push(route.complexes);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
