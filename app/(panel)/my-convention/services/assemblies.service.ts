import { parseCookies } from "nookies";

// ==============================
// LISTAR TODAS LAS ASAMBLEAS
// ==============================
export async function allAssembliesService() {
  const { accessToken } = parseCookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo las asambleas");
  }

  return response.json();
}

// ==============================
// DETALLE DE UNA ASAMBLEA
// ==============================
export async function assemblyDetailService(id: string) {
  const { accessToken } = parseCookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo la asamblea");
  }

  return response.json();
}

// ==============================
// LISTAR PREGUNTAS / ENCUESTAS
// ==============================
export async function assemblyPollsService(id: string) {
  const { accessToken } = parseCookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies/${id}/polls`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo las encuestas");
  }

  return response.json();
}

// ==============================
// VOTAR
// ==============================
export async function voteInPollService(data: {
  pollId: string;
  optionId: string;
  userId: string;
}) {
  const { accessToken } = parseCookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies/vote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al votar");
  }

  return response.json();
}

// ==============================
// RESULTADOS
// ==============================
export async function assemblyResultsService(id: string) {
  const { accessToken } = parseCookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies/${id}/results`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo resultados");
  }

  return response.json();
}
