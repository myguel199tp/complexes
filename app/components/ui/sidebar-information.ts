import { useAuth } from "@/app/middlewares/useAuth";
import { useEffect, useState, useTransition } from "react";

interface FormState {
  userName: string;
  userLastName: string;
  userRolName: string;
  fileName: string;
}

export default function SidebarInformation() {
  const isLoggedIn = useAuth();
  const [activeSection, setActiveSection] = useState("crear-anuncio");
  const [valueState, setValueState] = useState<FormState>({
    userName: "",
    userLastName: "",
    userRolName: "",
    fileName: "",
  });
  const [isPending, startTransition] = useTransition();

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (isLoggedIn) {
      const userName = localStorage.getItem("userName") || "";
      const userLastName = localStorage.getItem("userLastName") || "";
      const userRolName = localStorage.getItem("rolName") || "";
      const storedFileName = localStorage.getItem("fileName");
      const fileName = storedFileName
        ? `${BASE_URL}/${storedFileName.replace("\\", "/")}`
        : "";

      setValueState({ userName, userLastName, userRolName, fileName });
    }
  }, [isLoggedIn]);

  return {
    setActiveSection,
    setValueState,
    startTransition,
    isPending,
    activeSection,
    valueState,
  };
}
