"use client";

import { Modal } from "complexes-next-components";
import React from "react";
import { FiAlertCircle, FiShoppingCart } from "react-icons/fi";
import { useBuyPackageMutation } from "./useBuyPackageMutation";

interface PackageSelected {
  id: string;
  name: string;
  price: number | string;
  durationDays: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PackageSelected;
}

export default function ModalPackage({
  isOpen,
  onClose,
  selectedPackage,
}: Props) {
  const buyPackageMutation = useBuyPackageMutation();

  const handleBuy = () => {
    buyPackageMutation.mutate(
      {
        data: {
          packageId: selectedPackage.id,
        },
      },
      {
        onSuccess: (response) => {
          console.log("Compra exitosa", response);
          onClose();
        },
        onError: (error) => {
          console.error("Error comprando paquete", error);
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprar paquete">
      <div className="max-h-[80vh] overflow-y-auto p-2">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <FiAlertCircle size={32} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Confirmar compra</h2>

          <p className="mt-3 text-gray-500">
            ¿Está seguro de que desea adquirir el paquete{" "}
            <span className="font-semibold text-black">
              {selectedPackage.name}
            </span>
            ?
          </p>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Valor del paquete</p>

            <p className="mt-1 text-3xl font-extrabold text-black">
              ${Number(selectedPackage.price).toLocaleString("es-CO")}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Vigencia de {selectedPackage.durationDays} días
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={onClose}
            disabled={buyPackageMutation.isPending}
            className="flex-1 rounded-2xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={handleBuy}
            disabled={buyPackageMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            <FiShoppingCart />
            {buyPackageMutation.isPending ? "Comprando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
