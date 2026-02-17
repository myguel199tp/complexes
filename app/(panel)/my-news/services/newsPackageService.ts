import { CreatePackageResponse } from "./response/packageResponse";

export async function packageService(
  modules: string,
): Promise<CreatePackageResponse[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/packages/${modules}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}
