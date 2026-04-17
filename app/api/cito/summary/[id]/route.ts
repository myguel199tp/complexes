import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get("accessToken")?.value;
  const conjuntoId = req.headers.get("x-conjunto-id");

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/visit/${params.id}/summary`;

  const response = await fetch(backendUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-conjunto-id": conjuntoId || "",
    },
  });

  const data = await response.json();

  return NextResponse.json(data);
}
