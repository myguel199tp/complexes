import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ApprovalExpense,
  ApproverHistoryResult,
  ExpenseApproverSettings,
  ExpenseOwner,
  MyExpenseApproverStatus,
} from "./response/expenseApprovalResponse";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/**
 * Confirmación de gastos por el presidente: la administración designa quién
 * aprueba y el aprobador aprueba o rechaza cada gasto antes del pago.
 */
export class ExpenseApprovalServices {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/expense-approvals`;

  private async raw(path: string, { method = "GET", body }: RequestOptions = {}) {
    return fetchWithAuth(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "x-conjunto-id": useConjuntoStore.getState().conjuntoId || "",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(
    path: string,
    fallbackError: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const res = await this.raw(path, options);

    if (!res.ok) {
      // El backend explica por qué rechaza (por ejemplo, que en Platino
      // aprueba el presidente del consejo).
      const data = await res.json().catch(() => null);
      const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message;

      throw new Error(message || fallbackError);
    }

    return res.json();
  }

  // ─── Administración ───

  getApprover() {
    return this.request<ExpenseApproverSettings>(
      "/approver",
      "No se pudo consultar quién aprueba los gastos",
    );
  }

  getCandidates() {
    return this.request<ExpenseOwner[]>(
      "/candidates",
      "No se pudieron cargar los propietarios",
    );
  }

  designate(userId: string) {
    return this.request<ExpenseApproverSettings>(
      "/approver",
      "No se pudo designar al aprobador",
      { method: "PUT", body: { userId } },
    );
  }

  removeDesignation() {
    return this.request<ExpenseApproverSettings>(
      "/approver",
      "No se pudo quitar al aprobador",
      { method: "DELETE" },
    );
  }

  /** Quién aprobó y qué respondió cada uno; administración y aprobador de hoy. */
  getHistory() {
    return this.request<ApproverHistoryResult>(
      "/history",
      "No se pudo cargar el historial de aprobaciones",
    );
  }

  // ─── Aprobador ───

  getMyStatus() {
    return this.request<MyExpenseApproverStatus>(
      "/me",
      "No se pudo consultar tu estado de aprobador",
    );
  }

  list(status: "pending" | "reviewed" | "all") {
    return this.request<ApprovalExpense[]>(
      `?status=${status}`,
      "No se pudieron cargar los gastos",
    );
  }

  approve(id: string, comment?: string) {
    return this.request<ApprovalExpense>(
      `/${id}/approve`,
      "No se pudo aprobar el gasto",
      { method: "POST", body: { comment } },
    );
  }

  reject(id: string, comment: string) {
    return this.request<ApprovalExpense>(
      `/${id}/reject`,
      "No se pudo rechazar el gasto",
      { method: "POST", body: { comment } },
    );
  }

  /**
   * Abre el soporte (o, con `receipt`, el comprobante de pago) en otra
   * pestaña: el PDF pide sesión, así que va por blob.
   */
  async openFile(id: string, kind: "file" | "receipt" = "file") {
    // Se abre antes del fetch para que el navegador no la bloquee como popup.
    const tab = window.open("", "_blank");
    const res = await this.raw(
      `/${id}/file${kind === "receipt" ? "?kind=receipt" : ""}`,
    );

    if (!res.ok) {
      tab?.close();
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "No se pudo abrir el archivo");
    }

    const url = URL.createObjectURL(await res.blob());

    if (tab) tab.location.href = url;
    else window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
