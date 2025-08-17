export class DataReturnPassword {
  // 1. Enviar correo de recuperación
  async recoverPassword(email: string): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/recover-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.message || "Error al enviar el correo de recuperación"
      );
    }

    return response.json();
  }
}
