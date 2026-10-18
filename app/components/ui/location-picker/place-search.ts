/**
 * Las búsquedas para un lugar, de la más precisa a la menos.
 *
 * "Calle 10 # 43-12" no lo encuentra OpenStreetMap: lo que va después de "#"
 * o "No." es la placa, que en Colombia nombra la calle que cruza. Por eso se
 * prueba la dirección completa, luego la calle sola y por último el barrio.
 *
 * `city` puede venir como la guarda la sucursal web, "Envigado (Antioquia)":
 * el departamento entre paréntesis se quita.
 */
export function placeSearchQueries(place: {
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
}): string[] {
  const city = (place.city ?? "").replace(/\s*\([^()]*\)\s*$/, "").trim();
  const address = (place.address ?? "").trim();
  const street = address.split(/\s*(?:#|\bn[o°º]\.?\s)/i)[0].trim();
  const neighborhood = (place.neighborhood ?? "").trim();
  const join = (...parts: string[]) => parts.filter(Boolean).join(", ");

  return Array.from(
    new Set(
      [
        address && join(address, city),
        street && street !== address && join(street, city),
        neighborhood && join(neighborhood, city),
      ].filter(Boolean) as string[],
    ),
  );
}
