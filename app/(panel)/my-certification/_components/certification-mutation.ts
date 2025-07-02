import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataCertificationServices } from "../services/certificationServices";

export function useMutationCertification() {
  const api = new DataCertificationServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addCertification(formData);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error al guardar el certificado: ${errorMessage}`);
      }

      // Si todo salió bien
      router.push(route.myprofile);
      return await response.json(); // Si quieres devolver algo útil
    },
  });
}
