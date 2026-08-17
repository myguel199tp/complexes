import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeePayment, CreateAdminFeePaymentDto } from "./admin-fee-payment";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => {
  return {
    "Content-Type": "application/json",
    "x-conjunto-id": conjuntoId,
  };
};

export interface GenerateFeesResponse {
  message: string;
  generatedFees: number;
  /** Cuotas que ya existían y no se volvieron a crear. */
  skippedFees?: number;
  /** Unidades a las que se les generó cuota: una por apartamento. */
  units?: number;
  coefficients?: {
    percent: number;
    configured: boolean;
    isBalanced: boolean;
  };
  /** Avisos que no impiden generar pero conviene que el administrador vea. */
  warnings?: string[];
  /** Unidades que quedaron sin cuota, y por qué. */
  errors?: { apartment?: string; reason: string }[];
}

/**
 * Estado de los coeficientes de copropiedad.
 *
 * El coeficiente reparte el presupuesto entre las unidades: si no suman 100%,
 * el recaudo no coincide con lo aprobado en asamblea y nadie se entera hasta
 * que alguien lo suma a mano.
 */
export interface CoefficientsCheck {
  units: number;
  sum: number;
  percent: number;
  configured: boolean;
  isBalanced: boolean;
  missing: { tower?: string | null; apartment?: string | null }[];
  blocksGeneration: boolean;
}

/**
 * Lo que el residente necesita para pagar: a qué cuenta consignar y, si el
 * conjunto lo tiene habilitado, el enlace de pago digital.
 */
export interface PaymentInstructions {
  currency: string;
  digitalPaymentEnabled: boolean;
  digitalPaymentUrl: string | null;
  bankAccounts: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    isPrimary?: boolean;
  }[];
}

export class FeePaymentsService {
  /**
   * `getPayments` es la configuración de cobro completa y el backend la
   * restringe a EMPLOYEE. Este endpoint es el que puede consultar el residente.
   */
  static async getInstructions(
    conjuntoId: string,
  ): Promise<PaymentInstructions> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee-payment/instructions`,
      {
        method: "GET",
        headers: getHeaders(conjuntoId),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async createPayment(
    data: CreateAdminFeePaymentDto,
    conjuntoId: string,
  ): Promise<AdminFeePayment> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee-payment`, {
      method: "POST",
      headers: getHeaders(conjuntoId),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async getPayments(conjuntoId: string): Promise<AdminFeePayment[]> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee-payment`, {
      method: "GET",
      headers: getHeaders(conjuntoId),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  /**
   * Corregir una configuración existente.
   *
   * Antes no había PATCH: cambiar un monto o una tasa de mora obligaba a volver
   * a guardar el formulario, lo que insertaba otra fila y dejaba la anterior
   * conviviendo con la nueva.
   */
  static async updatePayment(
    id: string,
    data: CreateAdminFeePaymentDto,
    conjuntoId: string,
  ): Promise<AdminFeePayment> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee-payment/${id}`, {
      method: "PATCH",
      headers: getHeaders(conjuntoId),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async deletePayment(id: string, conjuntoId: string): Promise<void> {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee-payment/${id}`, {
      method: "DELETE",
      headers: getHeaders(conjuntoId),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }
  }

  static async getCoefficientsCheck(
    conjuntoId: string,
  ): Promise<CoefficientsCheck> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee-payment/coefficients-check`,
      {
        method: "GET",
        headers: getHeaders(conjuntoId),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async generateFees(
    configId: string,
    conjuntoId: string,
  ): Promise<GenerateFeesResponse> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee-payment/${configId}/generate-fees`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }
}
