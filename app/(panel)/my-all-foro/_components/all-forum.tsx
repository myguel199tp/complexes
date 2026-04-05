"use client";
import React, { useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import Forum from "./forum";

export default function AllForum() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Participa en el foro"
        onClick={handleBack}
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
      />

      <Forum />
    </div>
  );
}
