export async function allAssembliesService(conjuntoId: string) {
  const response = await fetch(`/api/assembly/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo las asambleas");
  }

  return response.json();
}

export async function assemblyDetailService(id: string, conjuntoId: string) {
  const response = await fetch(`/api/assem/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo la asamblea");
  }

  return response.json();
}

export async function assemblyPollsService(id: string, conjuntoId: string) {
  const response = await fetch(`/api/amsemb/${id}/poll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo las encuestas");
  }

  return response.json();
}

export async function voteInPollService(
  data: {
    pollId: string;
    optionId: string;
    userId: string;
  },
  conjuntoId: string,
) {
  const response = await fetch(`/api/realize`, {
    method: "POST",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al votar");
  }

  return response.json();
}

export async function assemblyResultsService(id: string, conjuntoId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/asem/${id}/resul`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Error obteniendo resultados");
  }

  return response.json();
}
