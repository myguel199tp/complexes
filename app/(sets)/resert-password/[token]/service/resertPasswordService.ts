export class DataResetPassword {
  async resetPassword(token: string, newPassword: string): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.message || "Error al restablecer la contraseña"
      );
    }

    return response.json();
  }
}
