import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";

//   MOTORCYCLE = "moto",
// }

// export enum ParkingType {
//   PUBLIC = "publico",
//   PRIVATE = "privado",
// }

// export interface vehicless {
//   type: VehicleType;
//   parkingType: ParkingType;
//   assignmentNumber?: string;
//   plaque: string;
// }

// interface Props {
//   role?: string;
//   apartment?: string;
//   plaque?: string;
//   namesuer?: string;
//   numberId?: string;
//   idConjunto?: string;
//   tower?: string;
//   isMainResidence?: boolean;
//   vehicles?: vehicless[];
// }

// 🧪 Helper para validar UUID v4
export function useFormMutation() {
  const api = new DataRegister();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUserBasic(formData);

      return response;
    },

    onSuccess: () => {
      showAlert("¡Operación completada!", "success");
    },

    onError: (error) => {
      console.error("❌ ERROR:", error);
      showAlert("Ocurrió un error en el proceso", "error");
    },
  });
}
