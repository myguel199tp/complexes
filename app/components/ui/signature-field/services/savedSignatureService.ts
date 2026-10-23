import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

/**
 * La firma guardada vive en el módulo del consejo (`/council/signature`), pero
 * es de la persona y no del conjunto: es la misma con la que firma las actas.
 * Aun así el guard de esas rutas pide `x-conjunto-id`.
 */
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/council/signature`;

const conjuntoHeader = () => ({
  "x-conjunto-id": useConjuntoStore.getState().conjuntoId || "",
});

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export class SavedSignatureService {
  /** La firma como data URL, lista para el PDF; `null` si no tiene. */
  async get(): Promise<string | null> {
    const res = await fetchWithAuth(BASE_URL, { headers: conjuntoHeader() });
    if (!res.ok) return null;

    const { hasSignature } = await res.json();
    if (!hasSignature) return null;

    const image = await fetchWithAuth(`${BASE_URL}/image`, {
      headers: conjuntoHeader(),
    });
    if (!image.ok) return null;

    return blobToDataUrl(await image.blob());
  }

  /**
   * Va como archivo y no como data URL en JSON: una firma ancha en pantalla
   * de alta densidad pasa fácil del límite de cuerpo JSON del backend.
   */
  async save(dataUrl: string): Promise<void> {
    const form = new FormData();
    form.append("signature", await (await fetch(dataUrl)).blob(), "firma.png");

    const res = await fetchWithAuth(BASE_URL, {
      method: "PUT",
      headers: conjuntoHeader(),
      body: form,
    });

    if (!res.ok) throw new Error("No se pudo guardar la firma");
  }

  async remove(): Promise<void> {
    const res = await fetchWithAuth(BASE_URL, {
      method: "DELETE",
      headers: conjuntoHeader(),
    });

    if (!res.ok) throw new Error("No se pudo borrar la firma guardada");
  }
}
