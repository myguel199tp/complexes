"use client";
import React, { useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import Forum from "./forum";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoReturnDownBackOutline } from "react-icons/io5";

export default function AllForum() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.foro);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Participa en el foro"
        onClick={handleBack}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        idicative="Agregar Foro"
      />
      <Forum />
    </div>
  );
}
