import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    // 👇 IMPORTANTE: para FormData NO uses req.json()
    const formData = await req.formData();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/record/register-record`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-conjunto-id": conjuntoId,
      },
      body: formData, // 👈 pasamos directamente el formData
    });
    console.log("HEADER EN ROUTE:", req.headers.get("x-conjunto-id"));
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
