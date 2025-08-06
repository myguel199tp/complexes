"use client";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useAuth } from "@/app/middlewares/useAuth";
import { useEffect, useState, useTransition } from "react";

interface FormState {
  userName: string;
  userLastName: string;
  fileName: string;
  activeButton: string;
}

export default function Topinformation() {
  const isLoggedIn = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [valueState, setValueState] = useState<FormState>({
    userName: "",
    userLastName: "",
    fileName: "",
    activeButton: "",
  });

  const [toogle, setToogle] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoggedIn) return;
    const payload = getTokenPayload();

    const storedUserName = payload?.name ?? "";
    const storedUserLastName = payload?.lastName ?? "";
    const fileImage = payload?.file || "";

    setValueState((prev) => ({
      ...prev,
      userName: storedUserName,
      userLastName: storedUserLastName,
      fileName: fileImage ? `${BASE_URL}/${fileImage.replace("\\", "/")}` : "",
    }));
  }, [isLoggedIn]);

  return {
    setToogle,
    setValueState,
    startTransition,
    toogle,
    isPending,
    valueState,
    isLoggedIn,
  };
}
