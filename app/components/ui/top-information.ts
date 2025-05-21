"use client";
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

    const storedUserName = localStorage.getItem("userName") ?? "";
    const storedUserLastName = localStorage.getItem("userLastName") ?? "";
    const storedFileName = localStorage.getItem("fileName");

    setValueState((prev) => ({
      ...prev,
      userName: storedUserName,
      userLastName: storedUserLastName,
      fileName: storedFileName
        ? `${BASE_URL}/${storedFileName.replace("\\", "/")}`
        : "",
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
