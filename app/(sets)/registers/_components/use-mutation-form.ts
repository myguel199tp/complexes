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

// 🧪 Helper para validar UUID v4
const isUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// 🔍 EXTRAER userId sin importar dónde venga
const extractUserId = (resp: any) => {
  return (
    resp?.data?.id ||
    resp?.data?.user?.id ||
    resp?.id ||
    resp?.user?.id ||
    resp?.data?.data?.id ||
    null
  );
};

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
      case "owner":
      case "tenant":
      case "resident":
      case "user":
      case "visitor":
      case "porter":
      case "cleaner":
      case "maintenance":
      case "gardener":
      case "pool_technician":
      case "accountant":
      case "messenger":
      case "vislogistics_assistantitor":
      case "community_manager":
      case "trainer":
      case "event_staff":
        return role.toLowerCase();
      default:
        return "employee";
    }
  };

  return useMutation({
    mutationFn: async (formData: FormData) => {
      let userId: string | null = null;

      try {
        console.log("📨 ENVIANDO formData a registerUser...");

        // 🧩 Registro usuario
        try {
          const response = await api.registerUser(formData);

          console.log(
            "📦 RESPUESTA registerUser COMPLETA:",
            JSON.stringify(response, null, 2)
          );

          const extracted = extractUserId(response);
          console.log("🔍 extractUserId encontró:", extracted);

          if (extracted) {
            userId = String(extracted);
            console.log("🆔 userId FINAL:", userId);

            if (!isUUID(userId)) {
              console.error("❌ NO ES UUID, pero igual seguirá.");
            }
          } else {
            console.warn("⚠️ NO se encontró userId en registerUser.");
          }
        } catch (error) {
          console.error("❌ ERROR en registerUser:", error);
        }

        // 🔥 SIEMPRE SE EJECUTA registerRelationConjunto (como pediste)
        try {
          const finalRole = mapRole(role);

          const relationPayload = {
            userId: userId ?? "NO_USER_ID",
            conjuntoId: String(idConjunto ?? ""),
            role: finalRole as UserRole,
            isMainResidence: isMainResidence ?? false,
            active: true,
            apartment,
            tower,
            plaque,
            namesuer,
            numberId,
            vehicles,
          };

          console.log(
            "🚀 PAYLOAD para registerRelationConjunto:",
            relationPayload
          );

          const relationResponse = await api.registerRelationConjunto(
            relationPayload
          );

          console.log(
            "✅ RESPUESTA registerRelationConjunto:",
            relationResponse
          );
        } catch (error) {
          console.error("❌ ERROR en registerRelationConjunto:", error);
        }

        // 💬 ALERTA
        showAlert("¡Operación completada!", "success");

        // 🔀 REDIRECCIÓN
        try {
          console.log("➡️ Redirigiendo según rol:", role);
          if (role === "owner") {
            router.push(route.user);
          } else {
            router.push(route.complexes);
          }
        } catch (error) {
          console.error("❌ Error en navegación:", error);
        }
      } catch (error) {
        console.error("❌ ERROR GENERAL:", error);
        showAlert("Ocurrió un error en el proceso", "error");
        throw error;
      }
    },
  });
}
