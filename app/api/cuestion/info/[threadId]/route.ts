import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { threadId: string } },
) {
  try {
    // Obtener token de cookies
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener header x-conjunto-id
    const conjuntoId = req.headers.get("x-conjunto-id");
    if (!conjuntoId) {
      return NextResponse.json(
        { message: "Falta x-conjunto-id" },
        { status: 400 },
      );
    }

    // URL del backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${params.threadId}`;

    // Petición al backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-conjunto-id": conjuntoId,
      },
    });

    const data = await response.json();

    // Si la respuesta del backend no es ok
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Retornar el thread
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: `Error en el servidor: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
