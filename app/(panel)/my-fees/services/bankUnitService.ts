import { CreateConjuntoBankPayload } from "../_components/bankUnit/otpBankMutation";
import { backendMessage } from "@/app/helpers/backendError";

// Vía el proxy propio: el Bearer lo pone el servidor desde la cookie httpOnly.
const BASE_URL = "/api/proxy";

/** Mensaje legible del error de Nest, o el de respaldo. */
const readError = (text: string, fallback: string) => {
  try {
    const body = JSON.parse(text);
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
  } catch {
    return fallback;
  }
};

const getHeaders = (conjuntoId: string) => {
  return {
    "Content-Type": "application/json",
    "x-conjunto-id": conjuntoId,
  };
};

// DTOs (ajústalos a tu backend)
export interface CreateConjuntoBankDto {
  bankName: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
}

export interface ConjuntoBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  isPrimary: boolean;
  isActive: boolean;
  /** Recibe lo que los propietarios pagan desde la app. Una por conjunto. */
  receivesOnlinePayments?: boolean;
}

export interface GenerateOtpResponse {
  message: string;
}

export class ConjuntoBankService {
  static async generateOtp(conjuntoId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/conjunto-bank/generate-otp`, {
        method: "POST",
        headers: getHeaders(conjuntoId),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ generateOtp error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 generateOtp crash:", error);
      throw error;
    }
  }

  static async create(data: CreateConjuntoBankPayload, conjuntoId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/conjunto-bank`, {
        method: "POST",
        headers: getHeaders(conjuntoId),
        body: JSON.stringify(data),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ create error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 create crash:", error);
      throw error;
    }
  }

  static async getAll(conjuntoId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/conjunto-bank`, {
        method: "GET",
        headers: getHeaders(conjuntoId),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ getAll error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 getAll crash:", error);
      throw error;
    }
  }

  static async setPrimary(id: string, conjuntoId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/conjunto-bank/${id}/primary`, {
        method: "POST",
        headers: getHeaders(conjuntoId),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ setPrimary error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 setPrimary crash:", error);
      throw error;
    }
  }

  static async deactivate(id: string, conjuntoId: string) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/conjunto-bank/${id}/deactivate`,
        {
          method: "POST",
          headers: getHeaders(conjuntoId),
        },
      );

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ deactivate error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 deactivate crash:", error);
      throw error;
    }
  }

  /** Esta cuenta pasa a recibir los pagos en línea (y deja de hacerlo la anterior). */
  static async enableOnlinePayments(id: string, conjuntoId: string) {
    const res = await fetch(
      `${BASE_URL}/api/conjunto-bank/${id}/online-payments`,
      { method: "POST", headers: getHeaders(conjuntoId) },
    );

    const text = await res.text();

    if (!res.ok) {
      throw new Error(readError(text, "No se pudieron activar los pagos en línea"));
    }

    return JSON.parse(text);
  }

  static async disableOnlinePayments(conjuntoId: string) {
    const res = await fetch(
      `${BASE_URL}/api/conjunto-bank/online-payments/disable`,
      { method: "POST", headers: getHeaders(conjuntoId) },
    );

    const text = await res.text();

    if (!res.ok) {
      throw new Error(readError(text, "No se pudieron desactivar los pagos en línea"));
    }

    return JSON.parse(text);
  }

  static async hasBankAccount(conjuntoId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/conjunto-bank/exists`, {
        method: "GET",
        headers: getHeaders(conjuntoId),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ hasBankAccount error:", text);
        throw new Error(backendMessage(text));
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 hasBankAccount crash:", error);
      throw error;
    }
  }
}
