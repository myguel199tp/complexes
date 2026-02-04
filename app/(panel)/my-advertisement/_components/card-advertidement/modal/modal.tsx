"use client";

import Summary from "@/app/(dashboard)/summary-immovables/_components/card-summary/summary";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";
import { Modal, Text, Button } from "complexes-next-components";
import { useState } from "react";
import { useCartStore } from "../../cart.store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function ModalProducts({ isOpen, onClose, products }: Props) {
  const addProduct = useCartStore((state) => state.addProduct);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const handleAdd = (product: Product) => {
    const productId = String(product.id);
    const qty = Number(quantities[productId]) || 1;

    addProduct(product, qty);

    console.log("✅ Producto enviado al store:", {
      id: productId,
      nombre: product.name,
      precio: product.price,
      cantidad: qty,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Productos"
      className="w-full md:!w-[1200px] max-h-[90vh] overflow-y-auto p-6"
      onClose={onClose}
    >
      <div className="flex flex-col gap-6">
        {products.map((product) => {
          const productId = String(product.id);

          return (
            <div key={productId} className="border rounded-xl p-4">
              <div className="flex gap-6">
                <div className="w-1/2">
                  <Summary images={product.files} />
                </div>

                <div className="w-1/2 flex flex-col gap-2">
                  <Text font="bold">{product.name}</Text>
                  <Text>${product.price.toLocaleString()}</Text>

                  <div className="flex gap-2 items-center">
                    <Text>Cantidad:</Text>
                    <input
                      type="number"
                      min={1}
                      value={quantities[productId] ?? "1"}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [productId]: e.target.value,
                        })
                      }
                      className="w-20 border px-2 py-1"
                    />
                  </div>

                  <Button onClick={() => handleAdd(product)}>
                    Adquirir producto
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
