import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { format: string } },
) {
  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const conjuntoId = req.headers.get("x-conjunto-id");

    if (!conjuntoId) {
      return NextResponse.json(
        { message: "Falta x-conjunto-id" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat/${params.format}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: `Error en el servidor: ${error}` },
      { status: 500 },
    );
  }
}
