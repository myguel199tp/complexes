import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } },
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${params.threadId}/reply`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: `Error en el servidor: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
