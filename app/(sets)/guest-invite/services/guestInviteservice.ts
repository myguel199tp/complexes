export async function getGuestInvite(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/guest-invite/${token}`
  );
  if (!res.ok) throw new Error("Invite invalid");
  return res.json();
}

export async function confirmGuestInvite(token: string, payload: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/guest-invite/${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Error confirming invite");
  return res.json();
}
