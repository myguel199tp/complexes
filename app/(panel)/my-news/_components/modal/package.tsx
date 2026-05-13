"use client";

import React from "react";
import { Modal, Text, Button } from "complexes-next-components";
import { FiCheckCircle, FiPackage, FiZap } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  module: string;
  maxItems: number;
  canHighlight: boolean;
  prioritySearch: boolean;
  price: number;
  durationDays: number;
}

export default function PackageModal({
  isOpen,
  onClose,
  name,
  maxItems,
  canHighlight,
  prioritySearch,
  price,
  durationDays,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl"
    >
      <div className="relative">
        {/* Header moderno */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-8">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-300 blur-2xl" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <FiPackage className="text-3xl text-white" />
            </div>

            <div>
              <Text className="text-sm font-medium uppercase tracking-widest text-blue-100">
                Paquete Premium
              </Text>

              <h2 className="text-3xl font-bold text-white">{name}</h2>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-md">
                <FiZap />
                {durationDays} días de acceso
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-6 p-6 bg-gradient-to-b from-white to-gray-50">
          {/* Precio */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500 text-sm">
                  Precio del paquete
                </Text>

                <h3 className="text-4xl font-extrabold text-gray-900">
                  ${price}
                </h3>

                <Text className="text-sm text-gray-500">COP</Text>
              </div>

              <div className="rounded-2xl bg-blue-100 p-4">
                <FiCheckCircle className="text-3xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="space-y-3">
            <Text className="text-lg font-bold text-gray-900">
              Beneficios incluidos
            </Text>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <Text>
                  Hasta <strong>{maxItems}</strong> publicaciones activas
                </Text>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <Text>
                  Duración de <strong>{durationDays} días</strong>
                </Text>
              </div>

              {canHighlight && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="h-3 w-3 rounded-full bg-pink-500" />
                  <Text>Publicaciones destacadas</Text>
                </div>
              )}

              {prioritySearch && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <Text>Mayor prioridad en búsquedas</Text>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              className="w-1/2 rounded-2xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100"
            >
              Cancelar
            </Button>

            <Button
              onClick={() => alert("Compra realizada")}
              className="w-1/2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700"
            >
              Comprar ahora
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
