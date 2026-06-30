/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginPage from "./loginpage";
import ComercioLoginPage from "../comercio/login/loginpage";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  HiOutlineBuildingOffice2,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { route } from "../_domain/constants/routes";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.12]"
    >
      <IoArrowBackOutline size={16} />
      Volver
    </button>
  );
}

const options: {
  key: "residencial" | "comercio";
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    key: "residencial",
    title: "Residencial",
    description: "Accede como residente o administrador de tu conjunto",
    icon: HiOutlineBuildingOffice2,
  },
  {
    key: "comercio",
    title: "Comercio",
    description: "Accede a tu cuenta de comercio",
    icon: HiOutlineShoppingBag,
  },
];

function AuthSelector() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <img
        src="/complex.jpg"
        alt="SmartPH"
        onClick={() => router.push(route.complexes)}
        className="absolute top-6 left-6 z-20 h-24 w-auto rounded-2xl cursor-pointer shadow-lg"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <h1 className="mt-5 text-3xl font-bold text-white">SmartPH</h1>
          <p className="max-w-sm text-sm text-slate-400">
            ¿Cómo deseas iniciar sesión?
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
          {options.map(({ key, title, description, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => router.push(`/auth?view=${key}`)}
              className="group flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.08)] transition hover:border-cyan-400/40 hover:bg-white/[0.07]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 transition group-hover:scale-110 group-hover:bg-cyan-500/20">
                <Icon size={32} />
              </span>
              <span className="text-xl font-semibold text-white">{title}</span>
              <span className="text-sm text-slate-400">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "residencial" || view === "comercio") {
    return (
      <div className="relative">
        <BackButton onClick={() => router.push("/auth")} />
        {view === "residencial" ? <LoginPage /> : <ComercioLoginPage />}
      </div>
    );
  }

  return <AuthSelector />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <AuthContent />
    </Suspense>
  );
}
