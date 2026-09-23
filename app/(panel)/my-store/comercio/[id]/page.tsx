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
import { fileUrl } from "@/app/helpers/fileUrl";
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

function money(value: number): string {
  return "$" + Number(value).toLocaleString("es-CO");
}

/**
 * Los datos del conjunto se guardan con `String(valor)`, así que una unidad sin
 * torre llega como la cadena "null" y no como vacío. Sin esto la dirección
 * automática saldría "Torre null, Apto 302".
 */
function clean(value?: string | null): string {
  const text = (value ?? "").trim();
  return text === "null" || text === "undefined" ? "" : text;
}

/** Iniciales del negocio, para cuando no hay logo —igual que en la vitrina. */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Marcador mientras carga el catálogo.
 *
 * "Cargando productos..." dejaba la columna vacía y luego aparecía la grilla de
 * golpe; el esqueleto adelanta la forma de lo que viene.
 */
function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-full animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

export default function StoreComercioPage() {
  const params = useParams<{ id: string }>();
  const branchId = params.id;
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);
  const conjuntoAddress = useConjuntoStore((state) => state.address);
  const neighborhood = useConjuntoStore((state) => state.neighborhood);
  const tower = useConjuntoStore((state) => state.tower);
  const apartment = useConjuntoStore((state) => state.apartment);

  const [cart, setCart] = useState<Record<string, CartLine>>({});
  // El residente pide desde su conjunto y su unidad ya está en la sesión:
  // escribir la dirección era copiar a mano un dato que la plataforma conoce, y
  // cada quien la escribía distinta. Sólo se abre el campo cuando la entrega va
  // a otro lado (portería, la casa de alguien más) o falta el dato.
  const [customAddress, setCustomAddress] = useState("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
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

  /**
   * A dónde se entrega, armado con lo que ya sabe la plataforma.
   *
   * El comercio es externo al conjunto, así que necesita la dirección de la
   * calle además de la unidad: con "Apto 302" solo, el domiciliario no llega.
   */
  const unitAddress = useMemo(() => {
    const street = [clean(conjuntoAddress), clean(neighborhood)]
      .filter(Boolean)
      .join(", ");

    const unit = [
      clean(tower) && `Torre ${clean(tower)}`,
      clean(apartment) && `Apto ${clean(apartment)}`,
    ]
      .filter(Boolean)
      .join(", ");

    return [clean(conjuntoName), street, unit].filter(Boolean).join(" · ");
  }, [conjuntoName, conjuntoAddress, neighborhood, tower, apartment]);

  // Sin datos de la unidad no hay nada que proponer: se pide escrita, como
  // antes, en vez de mandar el pedido sin dirección.
  const canUseUnitAddress = !!clean(apartment) && !!unitAddress;
  const addressIsCustom = useCustomAddress || !canUseUnitAddress;
  const deliveryAddress = addressIsCustom ? customAddress : unitAddress;

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

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const products = productsQuery.data ?? [];
  const branch = branchQuery.data;
  const logo = fileUrl(branch?.comercio.logoUrl);

  return (
    <div className="w-full pb-24 lg:!pb-0">
      <Link
        href={route.myStore}
        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm text-gray-200 transition hover:bg-white/20"
      >
        <span aria-hidden>←</span> Volver a la tienda
      </Link>

      {/* ENCABEZADO: antes eran dos líneas de texto sueltas y la pantalla
          empezaba sin identidad; ahora la tienda se presenta como en la
          vitrina, con su logo y sus datos de contacto. */}
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-indigo-600/10 p-4 ring-1 ring-white/10">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-2 ring-white/40">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={branch?.comercio.businessName ?? ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-bold text-white">
              {initials(branch?.comercio.businessName ?? "?")}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Title size="sm" font="bold" colVariant="on">
            {branch?.comercio.businessName ?? "Comercio"}
          </Title>

          {branch && (
            <Text size="sm" className="mt-1 text-gray-300">
              📍 {branch.name} · {branch.address}
            </Text>
          )}

          {branch?.comercio.phone && (
            <Text size="xs" className="text-gray-400">
              📞 {branch.comercio.phone}
            </Text>
          )}
        </div>

        {products.length > 0 && (
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
            {products.length} producto{products.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-6 lg:!flex-row lg:!items-start">
        <div className="w-full lg:!w-2/3">
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:!grid-cols-3">
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
              <div className="mb-3 text-4xl">🛒</div>
              <Text size="sm" className="text-gray-300">
                Este comercio aún no tiene productos disponibles.
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:!grid-cols-3">
              {products.map((product) => {
                const quantity = cart[product.id]?.quantity ?? 0;
                const soldOut = product.stock === 0 || !product.isAvailable;
                const atMax =
                  product.stock !== null && quantity >= product.stock;
                const image = fileUrl(product.images?.[0]);

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-3xl">
                          🛍️
                        </div>
                      )}

                      {/* Sólo se habla de existencias cuando el comercio las
                          lleva. Decir "quedan muchas" de un artículo que nadie
                          cuenta es inventarse un dato. */}
                      {product.stock !== null && product.stock <= 5 && (
                        <span
                          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow ${
                            product.stock === 0
                              ? "bg-red-500 text-white"
                              : "bg-amber-400 text-amber-950"
                          }`}
                        >
                          {product.stock === 0
                            ? "Agotado"
                            : `Quedan ${product.stock}`}
                        </span>
                      )}

                      {quantity > 0 && (
                        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-bold text-white shadow">
                          {quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-3">
                      <span className="truncate font-semibold text-gray-900">
                        {product.name}
                      </span>

                      <span className="line-clamp-2 text-xs text-gray-500">
                        {product.description}
                      </span>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {money(product.price)}
                        </span>

                        {product.stock !== null && product.stock > 5 && (
                          <span className="text-[11px] text-gray-400">
                            {product.stock} disponibles
                          </span>
                        )}
                      </div>

                      {/* El contador ocupaba el sitio del botón aunque no
                          hubiera nada en el carrito: mientras está en cero
                          basta con "Agregar", y sólo al pedir aparece el
                          control de cantidad. */}
                      <div className="mt-3">
                        {quantity === 0 ? (
                          <button
                            type="button"
                            disabled={soldOut}
                            onClick={() => addToCart(product)}
                            className="w-full rounded-full bg-emerald-500 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                          >
                            {soldOut ? "No disponible" : "Agregar"}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between rounded-full bg-gray-100 p-1">
                            <button
                              type="button"
                              aria-label={`Quitar una unidad de ${product.name}`}
                              onClick={() => decreaseFromCart(product.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                              −
                            </button>

                            <span className="font-semibold text-gray-900">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Agregar una unidad de ${product.name}`}
                              disabled={soldOut || atMax}
                              onClick={() => addToCart(product)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div id="pedido" className="w-full lg:!w-1/3">
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 lg:!sticky lg:!top-4">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <Title size="xs" font="bold">
                Tu pedido
              </Title>

              {itemCount > 0 && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {itemCount} artículo{itemCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {cartLines.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mb-2 text-3xl">🧺</div>
                <Text size="sm" className="text-gray-500">
                  Agrega productos para hacer tu pedido.
                </Text>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  {cartLines.map((line) => (
                    <div
                      key={line.product.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                          {line.quantity}
                        </span>
                        <span className="truncate text-gray-700">
                          {line.product.name}
                        </span>
                      </span>

                      <span className="shrink-0 font-semibold text-gray-900">
                        {money(Number(line.product.price) * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {money(total)}
                  </span>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Teléfono de contacto
                    </label>
                    <InputField
                      regexType="phone"
                      placeholder="300 000 0000"
                      sizeHelp="xs"
                      inputSize="sm"
                      rounded="md"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600">
                        Entregar en
                      </label>

                      {canUseUnitAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomAddress((prev) => !prev);
                            setCustomAddress("");
                          }}
                          className="text-xs font-semibold text-cyan-600 hover:underline"
                        >
                          {useCustomAddress
                            ? "Usar mi apartamento"
                            : "Entregar en otro lugar"}
                        </button>
                      )}
                    </div>

                    {addressIsCustom ? (
                      <TextAreaField
                        placeholder={
                          canUseUnitAddress
                            ? "¿Dónde te lo dejamos?"
                            : "Torre, apartamento, indicaciones"
                        }
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      />
                    ) : (
                      <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <span aria-hidden>📍</span>
                        <span className="text-sm text-gray-700">
                          {unitAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      ¿Cómo vas a pagar?
                    </label>

                    {/* Un desplegable escondía las otras dos formas de pago; en
                        tres opciones caben todas a la vista y se elige de una. */}
                    <div className="space-y-1.5">
                      {(
                        Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
                      ).map((method) => (
                        <label
                          key={method}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                            paymentMethod === method
                              ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="accent-emerald-600"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={() => setPaymentMethod(method)}
                          />
                          {PAYMENT_METHOD_LABELS[method]}
                        </label>
                      ))}
                    </div>

                    {/* El pago va directo al comercio: la plataforma no cobra ni
                        retiene nada, y decirlo evita que el residente espere una
                        pasarela que no existe. */}
                    <p className="mt-1.5 text-xs text-gray-500">
                      {paymentMethod === "transferencia"
                        ? "Le transfieres al comercio y reportas el pago desde “Mis pedidos”. El comercio lo verifica."
                        : "Pagas al recibir. El repartidor registra el cobro."}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Notas (opcional)
                    </label>
                    <TextAreaField
                      placeholder="Sin cebolla, timbre dañado…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <Button
                  colVariant="success"
                  size="full"
                  rounded="md"
                  disabled={orderMutation.isPending || cartLines.length === 0}
                  onClick={() => orderMutation.mutate()}
                >
                  {orderMutation.isPending
                    ? "Enviando..."
                    : `Hacer pedido · ${money(total)}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* En el teléfono el resumen queda debajo de todo el catálogo y no se ve
          que haya algo en el carrito; esta barra lo mantiene a la vista. */}
      {itemCount > 0 && (
        <a
          href="#pedido"
          className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-full bg-emerald-500 px-5 py-3 text-white shadow-2xl lg:!hidden"
        >
          <span className="text-sm font-semibold">
            {itemCount} artículo{itemCount > 1 ? "s" : ""} · {money(total)}
          </span>
          <span className="text-sm font-bold">Ver pedido →</span>
        </a>
      )}
    </div>
  );
}
