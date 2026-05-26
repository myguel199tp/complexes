import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreatePackageResponse } from "./response/packageResponse";

export async function packageService(
  modules: string,
): Promise<CreatePackageResponse[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/packages/module/${modules}`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}
