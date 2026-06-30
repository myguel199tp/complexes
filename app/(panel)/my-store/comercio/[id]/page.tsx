"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  InputField,
  TextAreaField,
  Title,
} from "complexes-next-components";
import Link from "next/link";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import {
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
      if (product.stock && nextQuantity > product.stock) {
        showAlert("No hay suficiente stock disponible", "error");
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

      <Title size="sm" font="bold" className="mt-2">
        {branchQuery.data?.comercio.businessName ?? "Comercio"}
      </Title>
      {branchQuery.data && (
        <p className="text-sm text-gray-500">
          {branchQuery.data.name} · {branchQuery.data.address}
        </p>
      )}

      <div className="flex flex-col md:!flex-row gap-6 mt-4">
        <div className="w-full md:!w-2/3">
          {productsQuery.isLoading ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">
              Este comercio aún no tiene productos disponibles.
            </p>
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
                      disabled={!product.isAvailable}
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
              <p className="text-gray-500 text-sm mt-2">
                Agrega productos para hacer tu pedido.
              </p>
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
