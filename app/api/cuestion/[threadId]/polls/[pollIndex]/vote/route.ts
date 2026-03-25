import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string; pollIndex: string } },
) {
  try {
    // Token de cookies
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Header x-conjunto-id (opcional si tu backend lo necesita)
    const conjuntoId = req.headers.get("x-conjunto-id");
    if (!conjuntoId) {
      return NextResponse.json(
        { message: "Falta x-conjunto-id" },
        { status: 400 },
      );
    }

    // Obtener query optionId
    const optionId = req.nextUrl.searchParams.get("optionId");
    if (!optionId) {
      return NextResponse.json(
        { message: "Falta optionId en query" },
        { status: 400 },
      );
    }

    // URL del backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${params.threadId}/polls/${params.pollIndex}/vote?optionId=${optionId}`;

    // Petición al backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-conjunto-id": conjuntoId,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Retornar el thread actualizado con los votos
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: `Error en el servidor: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
