"use client";

import Summary from "@/app/(dashboard)/summary-immovables/_components/card-summary/summary";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";
import { Modal, Text, Button } from "complexes-next-components";
import React, { useState } from "react";
import Form from "./form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function ModalProducts({ isOpen, onClose, products }: Props) {
  const [showForm, setShowForm] = useState(false);
  return (
    <Modal
      isOpen={isOpen}
      title="producto"
      onClose={onClose}
      className="w-full md:!w-[1200px] max-h-[90vh] overflow-y-auto p-6"
    >
      {products.map((product) => (
        <div key={product.id} className=" h-auto">
          {/* Imagen / Galería */}
          <div className="flex gap-4 w-full">
            <div className="w-full rounded-md overflow-hidden mb-4">
              <Summary images={product.files} />
            </div>
            {showForm && (
              <div className="flex flex-col gap-1 w-full">
                <Form />
              </div>
            )}

            {/* INFORMACIÓN */}
            {!showForm && (
              <div className="flex flex-col gap-1 w-full">
                <Text className="font-bold text-lg">{product.name}</Text>
                {product.description && (
                  <Text className="text-gray-600 text-sm line-clamp-3">
                    {product.description}
                  </Text>
                )}
                <Text className="font-semibold text-indigo-600 text-lg">
                  ${product.price.toLocaleString()}
                </Text>
                {product.category && (
                  <Text className="text-gray-500 text-sm">
                    {product.category}
                  </Text>
                )}
                <Button
                  colVariant="warning"
                  size="lg"
                  rounded="lg"
                  onClick={() => setShowForm(!showForm)}
                >
                  Adquirir producto
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </Modal>
  );
}
