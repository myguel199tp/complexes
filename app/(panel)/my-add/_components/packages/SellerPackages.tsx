"use client";

import React, { useState } from "react";
import { usePackageQuery } from "./query-package";
import { FiCheck, FiStar, FiZap, FiShoppingCart } from "react-icons/fi";
import ModalPackage from "./modal/modalPackage";
import { Text } from "complexes-next-components";

interface FeatureProps {
  text: string;
  active?: boolean;
}

interface PackageSelected {
  id: string;
  name: string;
  price: number | string;
  durationDays: number;
}

export default function SellerPackages() {
  const { data, isLoading } = usePackageQuery();

  const [selectedPackage, setSelectedPackage] =
    useState<PackageSelected | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-2 py-6 sm:px-4 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center sm:mb-10">
            <Text font="bold" size="lg" colVariant="on">
              Elige el paquete ideal para publicar y destacar tu emprendimiento.
            </Text>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((pkg) => {
              const isPremium = pkg.prioritySearch;
              const isSelected = selectedPackage?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() =>
                    setSelectedPackage({
                      id: pkg.id,
                      name: pkg.name,
                      price: pkg.price,
                      durationDays: pkg.durationDays,
                    })
                  }
                  className={`relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8 ${
                    isPremium ? "border-yellow-400" : "border-gray-200"
                  } ${isSelected ? "ring-4 ring-black/10 scale-[1.02]" : ""}`}
                >
                  <div className="mb-6">
                    {/* Insignia en el flujo, no absoluta: en móvil tapaba el nombre */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Text font="bold">{pkg.name}</Text>

                      {isPremium && (
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black sm:text-sm">
                          <FiStar />
                          Premium
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-4xl font-extrabold text-black sm:text-5xl">
                        ${Number(pkg.price).toLocaleString("es-CO")}
                      </span>

                      <span className="text-sm text-gray-500 sm:text-base">
                        / {pkg.durationDays} días
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Feature
                      text={`${pkg.maxItems} publicaciones disponibles`}
                    />

                    <Feature
                      text={
                        pkg.canHighlight
                          ? "Anuncios destacados"
                          : "Sin anuncios destacados"
                      }
                      active={pkg.canHighlight}
                    />

                    <Feature
                      text={
                        pkg.prioritySearch
                          ? "Prioridad en búsquedas"
                          : "Búsqueda estándar"
                      }
                      active={pkg.prioritySearch}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setSelectedPackage({
                        id: pkg.id,
                        name: pkg.name,
                        price: pkg.price,
                        durationDays: pkg.durationDays,
                      });
                    }}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold transition-all duration-300 sm:mt-8 sm:px-5 sm:py-4 sm:text-lg ${
                      isPremium
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    <FiShoppingCart size={20} className="shrink-0" />
                    Seleccionar paquete
                  </button>

                  {isPremium && (
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-yellow-100 blur-3xl" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedPackage && (
        <ModalPackage
          isOpen={true}
          selectedPackage={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </>
  );
}

function Feature({ text, active = true }: FeatureProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {active ? <FiCheck size={18} /> : <FiZap size={18} />}
      </div>

      <Text
        size="sm"
        className={`text-sm font-medium ${
          active ? "text-gray-700" : "text-gray-400"
        }`}
      >
        {text}
      </Text>
    </div>
  );
}
