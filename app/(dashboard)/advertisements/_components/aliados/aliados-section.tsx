/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { Text } from "complexes-next-components";
import { AliadoB2b, aliadosService } from "../../services/aliadosService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** Resuelve el logo del aliado (URL absoluta o archivo subido). */
function resolveLogo(logoUrl?: string): string | null {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return `${BASE_URL}/uploads/${logoUrl.replace(/^.*[\\/]/, "")}`;
}

export default function AliadosSection() {
  const [aliados, setAliados] = useState<AliadoB2b[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aliadosService()
      .then(setAliados)
      .catch(() => setAliados([]))
      .finally(() => setLoading(false));
  }, []);

  // No ocupa espacio si no hay aliados (o mientras carga y no hay datos).
  if (loading || aliados.length === 0) return null;

  return (
    <section className="mt-4 rounded-xl border-2 border-cyan-800 p-4">
      <div className=" items-center gap-2 mb-3">
        <Text font="bold" size="md" className="text-cyan-800">
          Encuentra el aliado que tu conjunto necesita
        </Text>
        <Text size="sm" className="text-gray-500">
          Empresas que trabajan con nosotros
        </Text>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {aliados.map((aliado) => {
          const logo = resolveLogo(aliado.logoUrl);
          return (
            <div
              key={aliado.id}
              className="min-w-[220px] max-w-[220px] border-2 rounded-lg p-3 hover:border-cyan-800 transition-colors flex flex-col"
            >
              <div className="relative flex items-center justify-center h-24 bg-gray-50 rounded-md overflow-hidden">
                {logo ? (
                  <img
                    src={logo}
                    alt={aliado.businessName}
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-3xl font-bold text-cyan-800">
                    {aliado.businessName?.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="absolute top-1 right-1 bg-cyan-800 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Aliado
                </span>
              </div>

              <div className="mt-2 flex-1">
                <Text font="semi" size="sm">
                  {aliado.businessName}
                </Text>
                {aliado.city ? (
                  <Text size="sm" className="text-gray-500">
                    {aliado.city}
                    {aliado.country ? `, ${aliado.country}` : ""}
                  </Text>
                ) : null}
                {aliado.description ? (
                  <Text size="sm" className="mt-1 line-clamp-3 text-gray-600">
                    {aliado.description}
                  </Text>
                ) : null}
              </div>

              {/* {aliado.phone ? (
                <Text size="sm" className="mt-2 text-cyan-800">
                  {aliado.phone}
                </Text>
              ) : null} */}
            </div>
          );
        })}
      </div>
    </section>
  );
}
