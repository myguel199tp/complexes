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

const isUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const extractUserId = (resp) => {
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
      const response = await api.registerUser(formData);

      const extracted = extractUserId(response);

      const userId = String(extracted);

      if (!isUUID(userId)) {
        console.warn("⚠️ El userId no es UUID válido:", userId);
      }

      const finalRole = mapRole(role);

      const relationPayload = {
        userId,
        conjuntoId: String(idConjunto),
        role: finalRole as UserRole,
        isMainResidence: Boolean(isMainResidence),
        active: true,
        apartment: apartment ?? "",
        tower: tower ?? "",
        plaque: plaque ?? "",
        namesuer: namesuer ?? "",
        numberId: numberId ?? "",
        vehicles: vehicles ?? [],
      };

      const relationResponse =
        await api.registerRelationConjunto(relationPayload);

      console.warn("✅ RESPUESTA registerRelationConjunto:", relationResponse);

      showAlert("¡Operación completada revisa tu correo!", "success");

      router.push(route.myuser);
    },
  });
}
