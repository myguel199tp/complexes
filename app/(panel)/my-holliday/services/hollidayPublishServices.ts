import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface PublishHollidayPayload {
  /** Número de RNT. Obligatorio en Colombia, ignorado en el resto de países. */
  rntNumber?: string;
  /**
   * NIT o cédula del titular del RNT. Es lo que permite comprobar que el
   * registro está a nombre de quien publica y no copiado del listado público.
   */
  rntHolderDocument?: string;
  /** Certificado del RNT. Opcional: el número es lo que exige la ley. */
  rntFile?: File | null;
}

/**
 * Error de publicación que trae el detalle estructurado del backend.
 *
 * Se conserva `code` para distinguir "falta el RNT" de "el RNT no existe" o
 * "está a nombre de otro" —cada caso tiene una salida distinta para el
 * anfitrión— en vez de comparar el texto del mensaje, que cambia con cualquier
 * retoque de redacción.
 */
export class PublishHollidayError extends Error {
  code?: string;
  rntSignupUrl?: string;

  constructor(message: string, code?: string, rntSignupUrl?: string) {
    super(message);
    this.name = "PublishHollidayError";
    this.code = code;
    this.rntSignupUrl = rntSignupUrl;
  }
}

export class HollidayServices {
  async publishHolliday(
    conjuntoId: string,
    id: string,
    payload: PublishHollidayPayload = {},
  ): Promise<Response> {
    if (!conjuntoId) {
      console.warn("⚠️ conjuntoId está vacío o undefined");
    }

    /**
     * Siempre multipart, lleve archivo o no: el endpoint pasa por
     * FileInterceptor y así el cuerpo tiene una sola forma. El Content-Type lo
     * pone el navegador —con su boundary—, por eso no se declara a mano.
     */
    const formData = new FormData();

    if (payload.rntNumber) {
      formData.append("rntNumber", payload.rntNumber);
    }

    if (payload.rntHolderDocument) {
      formData.append("rntHolderDocument", payload.rntHolderDocument);
    }

    if (payload.rntFile) {
      formData.append("rntFile", payload.rntFile);
    }

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/${id}/publish`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new PublishHollidayError(
        error?.message || "Error al publicar el holiday",
        error?.code,
        error?.rntSignupUrl,
      );
    }

    return response;
  }
}
