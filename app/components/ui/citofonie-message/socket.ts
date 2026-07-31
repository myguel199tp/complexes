import { io, Socket } from "socket.io-client";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Pide un ticket de corta vida para el handshake del WebSocket.
 *
 * Las cookies son httpOnly, así que el JS no puede leer el accessToken; la
 * petición va por el proxy, que adjunta el Bearer del lado servidor.
 */
export async function fetchWsTicket(): Promise<string | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/api/auth/ws-ticket`, {
      method: "POST",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.ticket ?? null;
  } catch {
    return null;
  }
}

/**
 * Devuelve el socket de inmediato (sin conectar) y lo conecta en cuanto llega el
 * ticket. Así quien lo usa puede registrar sus listeners de forma sincrónica, sin
 * carreras entre el `connect` y los `on(...)`.
 *
 * El backend ya no acepta `userId` ni `conjuntos` por el handshake: los tomaba
 * sin verificar, así que cualquiera podía declarar el id de otra persona y
 * recibir sus mensajes privados, o el de cualquier conjunto y recibir sus
 * alertas. La identidad ahora sale del ticket firmado.
 */
export const initializeSocket = (): Socket => {
  const socket = io(API_URL, { autoConnect: false });

  void fetchWsTicket().then((ticket) => {
    if (!ticket) {
      console.error("No se pudo obtener el ticket del socket: no se conecta");
      return;
    }

    socket.auth = { token: ticket };
    socket.connect();
  });

  return socket;
};
