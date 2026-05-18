import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/assemblies`;

// 🟢 Listar todas las asambleas
export async function allAssembliesService(conjuntoId: string) {
  const response = await fetchWithAuth(BASE_URL, {
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

// 🟢 Detalle de una asamblea
export async function assemblyDetailService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
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

// 🟢 Polls de una asamblea
export async function assemblyPollsService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/polls`, {
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

// 🟢 Asambleas activas
export async function activeAssembliesService(conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo asambleas activas");
  }

  return response.json();
}

// 🟢 Registrar asistencia
export async function attendAssemblyService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/attend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error registrando asistencia");
  }

  return response.json();
}

// 🟢 Validar si puede votar
export async function canVoteService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/can-vote`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error validando voto");
  }

  return response.json();
}

// 🟢 Votar
export async function voteInPollService(
  data: {
    pollId: string;
    optionId: string;
  },
  conjuntoId: string,
) {
  const response = await fetchWithAuth(`${BASE_URL}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

// 🟢 Resultados
export async function assemblyResultsService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo resultados");
  }

  return response.json();
}

// 🟢 Cerrar asamblea
export async function endAssemblyService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error cerrando asamblea");
  }

  return response.json();
}

// 🟢 Eliminar asamblea
export async function deleteAssemblyService(id: string, conjuntoId: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error eliminando asamblea");
  }

  return response.json();
}
