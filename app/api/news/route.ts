import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 👇 Leer cookie desde el request
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 👇 Leer header x-conjunto-id que envías desde el frontend
    const conjuntoId = req.headers.get("x-conjunto-id");

    if (!conjuntoId) {
      return NextResponse.json(
        { message: "Falta x-conjunto-id" },
        { status: 400 },
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/allNews`;

    const response = await fetch(backendUrl, {
      method: "GET",
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

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
