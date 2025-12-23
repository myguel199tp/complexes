const API = process.env.NEXT_PUBLIC_API_URL;

export async function createExternalStay(
  externalListingId: string,
  payload: any
) {
  const res = await fetch(`${API}/external-stays/${externalListingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error creating stay");
  return res.json();
}
