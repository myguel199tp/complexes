import { useTokenPayload } from "@/app/components/session-provider";
import { useAuth } from "@/app/middlewares/useAuth";
import { useEffect, useState, useTransition } from "react";

interface FormState {
  userName: string;
  userLastName: string;
  userRolName: string[]; 
  fileName: string;
}

export function useSidebarInformation() {
  const isLoggedIn = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [valueState, setValueState] = useState<FormState>({
    userName: "",
    userLastName: "",
    userRolName: [], 
    fileName: "",
  });
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const payload = useTokenPayload();

  useEffect(() => {
    if (isLoggedIn) {
      const userName = payload?.name || "";
      const userLastName = payload?.lastName || "";
      const userRolName = payload?.roles || []; 
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
  }, [BASE_URL, isLoggedIn, payload]);

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
