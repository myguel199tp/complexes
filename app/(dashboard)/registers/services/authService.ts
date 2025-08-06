export class DataRegister {
  async registerUser(formData: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  }

  async registerConjunto(formData: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/register-conjunto`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  }

  async registerConjuntoUser(formData: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  }
}
