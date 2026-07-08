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
  coeficiente?: number;
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
  coeficiente,
  vehicles,
}: Props) {
  const api = new DataRegister();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const VALID_ROLES = [
    "employee",
    "owner",
    "tenant",
    "resident",
    "user",
    "visitor",
    "porter",
    "cleaner",
    "maintenance",
    "gardener",
    "pool_technician",
    "accountant",
    "messenger",
    "logistics_assistant",
    "community_manager",
    "trainer",
    "event_staff",
    "partner",
  ];

  // Devuelve el rol tal cual si es válido. NO fuerza "employee" por defecto:
  // ese fallback silencioso hacía que cualquier rol no reconocido se guardara
  // como employee en la relación usuario-conjunto.
  const mapRole = (role?: string) => {
    const normalized = role?.toLowerCase();
    return normalized && VALID_ROLES.includes(normalized) ? normalized : "";
  };

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUser(formData);

      const extracted = extractUserId(response);

      const userId = String(extracted);

      if (!isUUID(userId)) {
        console.warn("⚠️ El userId no es UUID válido:", userId);
      }

      // El rol real viene en el formData (roles: string[]). Se usa como fuente
      // de verdad y solo se cae al prop `role` si por algún motivo no viniera.
      const rawRoles = formData.get("roles");
      let submittedRole: string | undefined;
      try {
        const parsed = rawRoles ? JSON.parse(String(rawRoles)) : [];
        submittedRole = Array.isArray(parsed) ? parsed[0] : undefined;
      } catch {
        submittedRole = undefined;
      }

      const finalRole = mapRole(submittedRole ?? role);

      if (!finalRole) {
        showAlert("Debes seleccionar un tipo de usuario válido", "error");
        throw new Error(`Rol inválido: ${submittedRole ?? role}`);
      }

      const relationPayload = {
        userId,
        conjuntoId: String(idConjunto),
        role: finalRole as UserRole,
        isMainResidence: Boolean(isMainResidence),
        coeficiente: coeficiente ?? 1,
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
