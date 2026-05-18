import { parseCookies } from "nookies";
import { CreateConjuntoBankPayload } from "../_components/bankUnit/otpBankMutation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => {
  const cookies = parseCookies();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cookies.accessToken}`,
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
        throw new Error(text);
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
        throw new Error(text);
      }

      console.log("✅ create response:", text);
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
        throw new Error(text);
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
        throw new Error(text);
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
        throw new Error(text);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 deactivate crash:", error);
      throw error;
    }
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
        throw new Error(text);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("🔥 hasBankAccount crash:", error);
      throw error;
    }
  }
}
