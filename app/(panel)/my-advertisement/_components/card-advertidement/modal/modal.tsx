"use client";

import Summary from "@/app/(dashboard)/summary-immovables/_components/card-summary/summary";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";
import { Modal, Text, Button, Title } from "complexes-next-components";
import { useState } from "react";
import { useCartStore } from "../../cart.store";
import { ShoppingCart, Check, Package2, Zap } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  /** El carrito necesita saber de qué negocio salió cada línea. */
  seller: { id: string; name: string };
}

export default function ModalProducts({
  isOpen,
  onClose,
  products,
  seller,
}: Props) {
  const addProduct = useCartStore((state) => state.addProduct);
  const items = useCartStore((state) => state.items);

  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const handleAdd = (product: Product) => {
    const productId = String(product.id);
    const qty = Math.max(1, Number(quantities[productId]) || 1);

    addProduct(product, qty, seller);

    // No se cierra el modal: lo normal es llevar varias cosas del mismo
    // negocio, y cerrar en el primer producto obligaba a volver a entrar.
    setQuantities((prev) => ({ ...prev, [productId]: "1" }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="
        !w-[98%]
        md:!w-[1200px]
        max-h-[92vh]
        overflow-y-auto
        !p-0
        !rounded-[32px]
        border
        border-white/10
        bg-[#0B1120]
        shadow-[0_0_60px_rgba(59,130,246,0.15)]
      "
    >
      <div className="relative overflow-hidden">
        {/* BACKGROUND EFFECTS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-cyan-500/20 blur-3xl rounded-full" />

          <div className="absolute bottom-[-120px] right-[-100px] w-[320px] h-[320px] bg-blue-600/20 blur-3xl rounded-full" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* HEADER */}
        <div className="relative z-10 border-b border-white/10 px-8 py-6 backdrop-blur-xl bg-white/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  from-cyan-800
                  to-blue-600
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_30px_rgba(34,211,238,0.45)]
                "
              >
                <Package2 className="w-8 h-8 text-white" />
              </div>

              <div>
                <Title className="text-3xl font-black tracking-tight">
                  {seller.name}
                </Title>
                <Text size="sm" className="text-cyan-700">
                  {products.length} producto
                  {products.length === 1 ? "" : "s"} disponibles
                </Text>
              </div>
            </div>

            <Button colVariant="primary" onClick={onClose}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Ir al carrito ({items.length})</span>
              </div>
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6">
          {products.map((product) => {
            const productId = String(product.id);
            const inCart = items.find((i) => i.id === productId);

            // stock null/undefined = el vendedor no lleva inventario.
            const stock = product.stock;
            const soldOut = typeof stock === "number" && stock <= 0;

            return (
              <div
                key={productId}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-2xl
                  hover:border-cyan-400/30
                  transition-all
                  duration-500
                "
              >
                {/* glow */}
                <div
                  className="
                    absolute
                    inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-all
                    duration-500
                    bg-gradient-to-r
                    from-cyan-500/10
                    via-blue-500/5
                    to-transparent
                  "
                />

                <div className="relative flex flex-col xl:flex-row">
                  {/* IMAGE */}
                  <div
                    className="
                      xl:w-[42%]
                      bg-black/20
                      border-b
                      xl:border-b-0
                      xl:border-r
                      border-white/10
                      overflow-hidden
                    "
                  >
                    <div className="group-hover:scale-[1.02] transition-transform duration-500">
                      <Summary images={product.files} />
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 p-7 flex flex-col justify-between gap-6">
                    <div className="space-y-5">
                      <div>
                        <Title as="h3" size="sm" font="bold" className="font-black leading-tight">
                          {product.name}
                        </Title>

                        {product.description && (
                          <Text size="sm" className="text-gray-400 mt-2">
                            {product.description}
                          </Text>
                        )}

                        <div className="flex items-center gap-2 mt-4">
                          <Zap className="w-5 h-5 text-cyan-400" />

                          <span className="text-4xl font-black text-cyan-300">
                            ${Number(product.price).toLocaleString("es-CO")}
                          </span>
                        </div>

                        {typeof stock === "number" && (
                          <Text
                            size="xs"
                            className={
                              soldOut
                                ? "text-red-400 mt-2"
                                : stock <= 5
                                  ? "text-amber-400 mt-2"
                                  : "text-gray-400 mt-2"
                            }
                          >
                            {soldOut
                              ? "Agotado"
                              : `Quedan ${stock} unidades`}
                          </Text>
                        )}
                      </div>

                      {!soldOut && (
                        <>
                          <Text>
                            Escribe la cantidad que deseas llevar
                          </Text>

                          {/* QUANTITY */}
                          <div
                            className="
                              w-fit
                              flex
                              items-center
                              gap-4
                              rounded-2xl
                              border
                              border-white/10
                              bg-black/20
                              px-4
                              py-3
                              backdrop-blur-xl
                            "
                          >
                            <Text font="bold" size="md" colVariant="on">
                              Cantidad
                            </Text>

                            <input
                              type="number"
                              min={1}
                              max={typeof stock === "number" ? stock : undefined}
                              value={quantities[productId] ?? "1"}
                              onChange={(e) =>
                                setQuantities({
                                  ...quantities,
                                  [productId]: e.target.value,
                                })
                              }
                              className="
                                w-24
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-3
                                py-2
                                text-white
                                outline-none
                                transition-all
                                focus:border-cyan-400
                                focus:ring-4
                                focus:ring-cyan-400/20
                              "
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* ACTION */}
                    <div className="flex items-center justify-end gap-4">
                      {inCart && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                          <Check className="w-4 h-4" />
                          {inCart.quantity} en el carrito
                        </span>
                      )}

                      <Button
                        colVariant="primary"
                        disabled={soldOut}
                        onClick={() => handleAdd(product)}
                        className="
                          !h-[56px]
                          !px-8
                          !rounded-2xl
                          !border-0
                          bg-gradient-to-r
                          from-cyan-500
                          to-blue-600
                          hover:scale-[1.03]
                          hover:shadow-[0_0_35px_rgba(34,211,238,0.5)]
                          transition-all
                          duration-300
                          text-white
                          font-bold
                          tracking-wide
                        "
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-5 h-5" />

                          <span>
                            {soldOut ? "Agotado" : "Agregar al carrito"}
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
