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
      <div className="w-full px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <Text font="bold" size="lg">
              Elige el paquete ideal para publicar y destacar tu emprendimiento.
            </Text>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
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
                  className={`relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isPremium ? "border-yellow-400" : "border-gray-200"
                  } ${isSelected ? "ring-4 ring-black/10 scale-[1.02]" : ""}`}
                >
                  {isPremium && (
                    <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-black">
                      <FiStar />
                      Premium
                    </div>
                  )}

                  <div className="mb-6">
                    <Text>{pkg.name}</Text>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-5xl font-extrabold text-black">
                        ${Number(pkg.price).toLocaleString("es-CO")}
                      </span>

                      <span className="mb-1 text-gray-500">
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
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-semibold transition-all duration-300 ${
                      isPremium
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    <FiShoppingCart size={20} />
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
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {active ? <FiCheck size={18} /> : <FiZap size={18} />}
      </div>

      <p
        className={`text-sm font-medium ${
          active ? "text-gray-700" : "text-gray-400"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
