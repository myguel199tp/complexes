import { useRouter } from "next/navigation";
import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { UserRole } from "../services/response/registerRelationResponse";

export enum VehicleType {
  CAR = "carro",
  MOTORCYCLE = "moto",
}

// Enum para tipo de parqueadero
export enum ParkingType {
  PUBLIC = "publico",
  PRIVATE = "privado",
}

export interface vehicless {
  type: VehicleType;
  parkingType: ParkingType;
  assignmentNumber?: string;
  plaque: string;
}

interface Props {
  role?: string;
  apartment?: string;
  plaque?: string;
  namesuer?: string;
  numberId?: string;
  idConjunto?: string;
  tower?: string;
  isMainResidence?: boolean;
  vehicles?: vehicless[];
}

export function useMutationForm({
  role,
  idConjunto,
  apartment,
  plaque,
  namesuer,
  numberId,
  tower,
  isMainResidence,
  vehicles,
}: Props) {
  const api = new DataRegister();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
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
      console.log("📦 RESPUESTA registerUser:", response);
      const userId = response?.data?.id;

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

        const relationPayload = {
          userId: String(userId), // ✅ en lugar de user: { id: ... }
          conjuntoId: String(conjuntoIdFinal), // ✅ en lugar de conjunto: { id: ... }
          role: finalRole as
            | UserRole.OWNER
            | UserRole.OWNER
            | UserRole.TENANT
            | UserRole.RESIDENT
            | UserRole.VISITOR
            | UserRole.USER
            | UserRole.FAMILY
            | UserRole.EMPLOYEE
            | UserRole.PORTER
            | UserRole.CLEANER
            | UserRole.MAINTENANCE
            | UserRole.GARDENER
            | UserRole.POOL_TECH
            | UserRole.ACCOUNTANT
            | UserRole.MESSENGER
            | UserRole.LOGISTICS_ASSISTANT
            | UserRole.COMMUNITY_MANAGER
            | UserRole.TRAINER
            | UserRole.EVENT_STAFF,

          isMainResidence: isMainResidence,
          active: true,
          apartment,
          tower,
          plaque,
          namesuer,
          numberId,
          vehicles,
        };

        console.log("🚀 PAYLOAD RELACIÓN:", relationPayload);

        const relationResponse = await api.registerRelationConjunto(
          relationPayload
        );
        console.log("✅ Relación registrada correctamente:", relationResponse);

        if (response.status === 201) {
          showAlert("¡Operación exitosa!", "success");
        }
        console.log("✅ Relación registrada correctamente:", relationResponse);
      } else {
        console.log("🏠 Intente neuvamente");
      }

      if (role !== "owner") {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.complexes);
      }
      if (role === "owner") {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.user);
      }
      // 4. Redirigir

      return response;
    },
  });
}
