"use client";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import AllInfoPqr from "./all-info-pqr";

export default function AllPqrInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const handleNavigate = () => {
    setLoading(true);
    router.push(route.pqr);
  };
  return (
    <div key={language}>
      <HeaderAction
        title="PQR generados"
        tooltip="PQR generados"
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div className="cursor-pointer">
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative="Generar PQR"
      />
      <AllInfoPqr />;
    </div>
  );
}
