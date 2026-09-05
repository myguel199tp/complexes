"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  InputField,
  TextAreaField,
  Title,
  Text,
} from "complexes-next-components";
import Link from "next/link";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  createStoreOrder,
  getBranch,
  getBranchProducts,
  PublicProduct,
} from "../../services/comercioStoreService";

interface CartLine {
  product: PublicProduct;
  quantity: number;
}

export default function StoreComercioPage() {
  const params = useParams<{ id: string }>();
  const branchId = params.id;
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  // Contraentrega en efectivo es el defecto porque es como se paga hoy: el
  // módulo no tenía pago y todo se cobraba en la puerta.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    "contraentrega_efectivo",
  );

  const branchQuery = useQuery({
    queryKey: ["store-branch", branchId],
    queryFn: () => getBranch(conjuntoId, branchId),
    enabled: !!conjuntoId && !!branchId,
  });

  const productsQuery = useQuery({
    queryKey: ["store-branch-products", branchId],
    queryFn: () => getBranchProducts(conjuntoId, branchId),
    enabled: !!conjuntoId && !!branchId,
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      createStoreOrder(conjuntoId, {
        branchId,
        items: Object.values(cart).map((line) => ({
          itemType: "product",
          productId: line.product.id,
          quantity: line.quantity,
        })),
        contactPhone: contactPhone || undefined,
        deliveryAddress: deliveryAddress || undefined,
        paymentMethod,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      showAlert("¡Pedido realizado correctamente!", "success");
      router.push(route.myStoreOrders);
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function addToCart(product: PublicProduct) {
    setCart((prev) => {
      const existing = prev[product.id];
      const nextQuantity = (existing?.quantity ?? 0) + 1;

      // `null` = el comercio no lleva inventario de este artículo, así que no
      // hay tope. Se compara contra null explícitamente y no por falsedad,
      // porque `0` sí es un tope —significa agotado— y con `product.stock &&`
      // se colaba al carrito para acabar rebotando en el servidor.
      if (product.stock !== null && nextQuantity > product.stock) {
        showAlert(
          product.stock === 0
            ? `"${product.name}" está agotado`
            : `Solo quedan ${product.stock} unidades de "${product.name}"`,
          "error",
        );
        return prev;
      }
      return { ...prev, [product.id]: { product, quantity: nextQuantity } };
    });
  }

  function decreaseFromCart(productId: string) {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const rest = { ...prev };
        delete rest[productId];
        return rest;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  }

  const cartLines = Object.values(cart);
  const total = useMemo(
    () =>
      cartLines.reduce(
        (sum, line) => sum + Number(line.product.price) * line.quantity,
        0,
      ),
    [cartLines],
  );

  const products = productsQuery.data ?? [];

  return (
    <div className="w-full">
      <Link href={route.myStore} className="text-cyan-700 text-sm">
        ← Volver a la tienda
      </Link>

      <Title size="sm" font="bold" className="mt-2" colVariant="on">
        {branchQuery.data?.comercio.businessName ?? "Comercio"}
      </Title>
      {branchQuery.data && (
        <Text size="sm" colVariant="on">
          {branchQuery.data.name} · {branchQuery.data.address}
        </Text>
      )}

      <div className="flex flex-col md:!flex-row gap-6 mt-4">
        <div className="w-full md:!w-2/3">
          {productsQuery.isLoading ? (
            <Text size="sm" colVariant="on">
              Cargando productos...
            </Text>
          ) : products.length === 0 ? (
            <Text size="sm" colVariant="on">
              Este comercio aún no tiene productos disponibles.
            </Text>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow flex flex-col gap-1"
                >
                  {product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <span className="font-bold text-gray-800">
                    {product.name}
                  </span>
                  <span className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </span>
                  <span className="font-semibold text-gray-700">
                    ${Number(product.price).toLocaleString()}
                  </span>

                  {/* Sólo se habla de existencias cuando el comercio las lleva.
                      Decir "quedan muchas" de un artículo que nadie cuenta es
                      inventarse un dato. */}
                  {product.stock !== null && (
                    <span
                      className={`text-xs ${
                        product.stock === 0
                          ? "text-red-500 font-semibold"
                          : product.stock <= 5
                            ? "text-amber-600"
                            : "text-gray-500"
                      }`}
                    >
                      {product.stock === 0
                        ? "Agotado"
                        : `Quedan ${product.stock}`}
                    </span>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="xs"
                      rounded="md"
                      disabled={!cart[product.id]}
                      onClick={() => decreaseFromCart(product.id)}
                    >
                      -
                    </Button>
                    <span>{cart[product.id]?.quantity ?? 0}</span>
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant="success"
                      disabled={
                        !product.isAvailable ||
                        product.stock === 0 ||
                        // Ya tiene en el carrito todo lo que hay.
                        (product.stock !== null &&
                          (cart[product.id]?.quantity ?? 0) >= product.stock)
                      }
                      onClick={() => addToCart(product)}
                    >
                      + Agregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:!w-1/3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow sticky top-4">
            <Title size="xs" font="bold">
              Tu pedido
            </Title>

            {cartLines.length === 0 ? (
              <Text size="sm" className="text-gray-500 mt-2">
                Agrega productos para hacer tu pedido.
              </Text>
            ) : (
              <div className="mt-2 space-y-2">
                {cartLines.map((line) => (
                  <div
                    key={line.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {line.quantity}x {line.product.name}
                    </span>
                    <span>
                      $
                      {(
                        Number(line.product.price) * line.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>

                <InputField
                  regexType="phone"
                  placeholder="Teléfono de contacto"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />

                <TextAreaField
                  placeholder="Dirección de entrega"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
                />

                <div>
                  <label className="text-xs text-gray-500">
                    ¿Cómo vas a pagar?
                  </label>
                  <select
                    className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                  >
                    {(
                      Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
                    ).map((method) => (
                      <option key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </option>
                    ))}
                  </select>
                  {/* El pago va directo al comercio: la plataforma no cobra ni
                      retiene nada, y decirlo evita que el residente espere una
                      pasarela que no existe. */}
                  <p className="mt-1 text-xs text-gray-500">
                    {paymentMethod === "transferencia"
                      ? "Le transfieres al comercio y reportas el pago desde “Mis pedidos”. El comercio lo verifica."
                      : "Pagas al recibir. El repartidor registra el cobro."}
                  </p>
                </div>

                <TextAreaField
                  placeholder="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
                />

                <Button
                  colVariant="success"
                  size="full"
                  rounded="md"
                  disabled={orderMutation.isPending || cartLines.length === 0}
                  onClick={() => orderMutation.mutate()}
                >
                  {orderMutation.isPending ? "Enviando..." : "Hacer pedido"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
