import { useRouter } from "next/navigation";
import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";

interface props {
  role?: string;
  apartment?: string;
  plaque?: string;
  numberid?: string;
  idConjunto?: string;
}

export function useMutationForm({
  role,
  idConjunto,
  apartment,
  plaque,
  numberid,
}: props) {
  const api = new DataRegister();
  const router = useRouter();

  const mapRole = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "employee":
        return "employee";
      case "owner":
        return "owner";
      case "tenant":
        return "tenant";
      default:
        return "employee";
    }
  };

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const conjuntoIdFinal = idConjunto;

      if (!conjuntoIdFinal) {
        throw new Error("No se puede registrar: idConjunto no disponible");
      }

      // 1. Registrar usuario
      const response = await api.registerUser(formData);
      const userId = response?.id;

      if (!userId) {
        throw new Error("No se obtuvo userId del registro de usuario");
      }

      // 2. Preparar payload de relación con props
      const finalRole = mapRole(role);
      const isMainResidence = role?.toLowerCase() === "owner";

      const relationPayload = {
        user: { id: String(userId) },
        conjunto: { id: String(conjuntoIdFinal) },
        role: finalRole as "employee" | "owner" | "tenant",
        isMainResidence,
        active: true,
        apartment: apartment, // 👈 props
        plaque: plaque, // 👈 props
        numberid: numberid, // 👈 props
      };

      console.log("🔹 Payload para relación:", relationPayload);

      // 3. Registrar relación
      const relationResponse = await api.registerRelationConjunto(
        relationPayload
      );
      console.log("✅ Relación registrada correctamente:", relationResponse);

      // 4. Redirigir
      router.push(route.complexes);

      return response;
    },
  });
}
