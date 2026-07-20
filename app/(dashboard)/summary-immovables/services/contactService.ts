import { ICreateContact } from "./response/contactResponse";

export class ContactServices {
  /* Endpoint público: el visitante que deja sus datos no tiene sesión,
     por eso no se usa fetchWithAuth. */
  async contactServices(data: ICreateContact): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return response;
  }
}
