import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // 🔥 Construir URL pública completa
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const publicUrl = `${baseUrl}/uploads/${file.name}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al subir imagen", details: error },
      { status: 500 },
    );
  }
}
