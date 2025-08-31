import { useRouter } from "next/navigation";
import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";

interface props {
  role?: string;
  apartment?: string;
  plaque?: string;
  namesuer?: string;
  numberid?: string;
  idConjunto?: string;
}

export function useMutationForm({
  role,
  idConjunto,
  apartment,
  plaque,
  namesuer,
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
      case "resident":
        return "resident";
      case "user":
        return "user";
      case "visitor":
        return "visitor";
      default:
        return "employee";
    }
  };

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // 1. Registrar usuario siempre
      const response = await api.registerUser(formData);
      const userId = response?.id;

      if (!userId) {
        throw new Error("No se obtuvo userId del registro de usuario");
      }

      // 2. Solo registrar relación con conjunto si el role NO es "user"
      if (role?.toLowerCase() !== "user") {
        const conjuntoIdFinal = idConjunto;

        if (!conjuntoIdFinal) {
          throw new Error("No se puede registrar: idConjunto no disponible");
        }

        // Preparar payload de relación con props
        const finalRole = mapRole(role);
        const isMainResidence = role?.toLowerCase() === "owner";

        const relationPayload = {
          user: { id: String(userId) },
          conjunto: { id: String(conjuntoIdFinal) },
          role: finalRole as
            | "owner"
            | "tenant"
            | "resident"
            | "visitor"
            | "employee"
            | "user",
          isMainResidence,
          active: true,
          apartment: apartment,
          plaque: plaque,
          namesuer: namesuer,
          numberid: numberid,
        };

        // 3. Registrar relación
        const relationResponse = await api.registerRelationConjunto(
          relationPayload
        );
        console.log("✅ Relación registrada correctamente:", relationResponse);
      } else {
        console.log(
          "🏠 Usuario tipo 'user' registrado sin relación de conjunto (vive en casa)"
        );
      }

      if (role !== "owner") {
        router.push(route.complexes);
      }
      // 4. Redirigir

      return response;
    },
  });
}
