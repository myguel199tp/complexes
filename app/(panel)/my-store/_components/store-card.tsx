"use client";

import Link from "next/link";
import { Text } from "complexes-next-components";
import { fileUrl } from "@/app/helpers/fileUrl";
import { route } from "@/app/_domain/constants/routes";
import { PublicBranch } from "../services/comercioStoreService";

/**
 * Iniciales del negocio, para cuando no hay logo.
 *
 * Un cuadro vacío se lee como imagen rota; dos letras sobre color se leen como
 * una marca.
 */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Color estable a partir del nombre.
 *
 * Sin catálogo de fotos todas las tarjetas quedaban idénticas y la vitrina se
 * leía como una lista. Derivarlo del nombre —y no al azar— hace que cada tienda
 * conserve su color entre recargas, que es lo que permite reconocerla de un
 * vistazo.
 */
const COVERS = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-violet-600",
];

function coverFor(name: string): string {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }

  return COVERS[hash % COVERS.length];
}

export default function StoreCard({ branch }: { branch: PublicBranch }) {
  const { comercio } = branch;

  const logo = fileUrl(comercio.logoUrl);
  const photos = (branch.previewImages ?? [])
    .map((image) => fileUrl(image))
    .filter((url): url is string => !!url);

  const productCount = branch.productCount ?? 0;
  const cover = coverFor(comercio.businessName);

  return (
    <Link
      href={`${route.storeComercio}/${branch.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
    >
      {/* PORTADA: el catálogo por encima, o el color de la marca */}
      <div className="relative h-32">
        {photos.length > 0 ? (
          <div className="grid h-full grid-cols-3 gap-px bg-gray-100">
            {photos.map((photo, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo}
                src={photo}
                alt=""
                className={`h-full w-full object-cover ${
                  // Con una sola foto ocupa toda la portada en vez de dejar dos
                  // huecos grises al lado.
                  photos.length === 1
                    ? "col-span-3"
                    : photos.length === 2 && index === 0
                      ? "col-span-2"
                      : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${cover}`} />
        )}

        {/* Oscurecido para que el logo y el contador se lean sobre cualquier foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {productCount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
            {productCount} producto{productCount > 1 ? "s" : ""}
          </span>
        )}

        <div className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-lg ring-2 ring-white">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={comercio.businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${cover} text-lg font-bold text-white`}
            >
              {initials(comercio.businessName)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-8">
        <Text font="bold" className="text-gray-900">
          {comercio.businessName}
        </Text>

        {comercio.description && (
          <Text size="xs" className="line-clamp-2 text-gray-500">
            {comercio.description}
          </Text>
        )}

        <Text size="xs" className="mt-1 text-gray-500">
          📍 {branch.name} · {branch.address}
        </Text>

        {comercio.phone && (
          <Text size="xs" className="text-gray-500">
            📞 {comercio.phone}
          </Text>
        )}

        {/* La llamada a la acción que no había: la tarjeta era un bloque de
            texto sin nada que dijera que se podía abrir. */}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600">
          {productCount > 0 ? "Ver productos" : "Ver tienda"}
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
