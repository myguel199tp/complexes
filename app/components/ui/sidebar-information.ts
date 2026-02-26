// sidebar-information.ts
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useAuth } from "@/app/middlewares/useAuth";
import { useEffect, useState, useTransition } from "react";

interface FormState {
  userName: string;
  userLastName: string;
  userRolName: string[]; // 👈 ahora es array
  fileName: string;
}

// 👇 renombrado a "useSidebarInformation"
export function useSidebarInformation() {
  const isLoggedIn = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [valueState, setValueState] = useState<FormState>({
    userName: "",
    userLastName: "",
    userRolName: [], // 👈 inicializamos como array vacío
    fileName: "",
  });
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isLoggedIn) {
      const payload = getTokenPayload();

      const userName = payload?.name || "";
      const userLastName = payload?.lastName || "";
      const userRolName = payload?.roles || []; // 👈 siempre array
      const fileImage = payload?.file || "";

      const fileName = fileImage
        ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
        : "";

      setValueState({
        userName,
        userLastName,
        userRolName,
        fileName,
      });
      setIsReady(true);
    }
  }, [BASE_URL, isLoggedIn]);

  return {
    setActiveSection,
    setValueState,
    startTransition,
    isPending,
    activeSection,
    valueState,
    isReady,
  };
}
