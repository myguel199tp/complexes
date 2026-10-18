import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { PettyCashSummary } from "./response/pettyCashResponse";

/**
 * Caja menor: el presidente asigna un monto y la administración paga gastos
 * pequeños con él, sin pedir aprobación, mientras quepan en el saldo.
 */
export class PettyCashServices {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/petty-cash`;

  private async request<T>(
    path: string,
    fallbackError: string,
    init: RequestInit = {},
  ): Promise<T> {
    const res = await fetchWithAuth(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "x-conjunto-id": useConjuntoStore.getState().conjuntoId || "",
        ...(typeof init.body === "string" && {
          "Content-Type": "application/json",
        }),
      },
    });

    if (!res.ok) {
      // El backend explica por qué rechaza (por ejemplo, que no alcanza el
      // saldo); eso sirve más que un mensaje genérico.
      const data = await res.json().catch(() => null);
      const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message;
      throw new Error(message || fallbackError);
    }

    return res.json();
  }

  getSummary(): Promise<PettyCashSummary> {
    return this.request("", "No se pudo cargar la caja menor");
  }

  assign(amount: number, note?: string): Promise<PettyCashSummary> {
    return this.request("/assignments", "No se pudo recargar la caja menor", {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    });
  }

  /** Multipart: el soporte (PDF) va en `file` y es opcional. */
  registerExpense(form: FormData): Promise<{ balance: number }> {
    return this.request("/expenses", "No se pudo registrar el gasto", {
      method: "POST",
      body: form,
    });
  }
}
