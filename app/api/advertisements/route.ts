import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    const names = searchParams.get("names");
    const contact = searchParams.get("contact");
    const typeService = searchParams.get("typeService");

    const queryParams = new URLSearchParams();

    if (names) queryParams.append("names", names);
    if (contact) queryParams.append("contact", contact);
    if (typeService) queryParams.append("typeService", typeService);

    const backendUrl = `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/seller-profile/byAllData?${queryParams.toString()}`;

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
      { message: `Error en el servidor ${error}` },
      { status: 500 },
    );
  }
}
