"use client";
import React, { useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import Form from "./form";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";

export default function Asembly() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myConvention);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={"Generar Asamblea"}
        tooltip={"Asambleas agregadas"}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        idicative={"Asambleas agregadas"}
      />
      <Form />
    </div>
  );
}
