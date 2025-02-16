"use client";

import { Button, SelectField, Text } from "complexes-next-components";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { initializeSocket } from "./socket";
import { allUserListService } from "./services/userlistSerive";
import { UsersResponse } from "@/app/(panel)/my-new-user/services/response/usersResponse";
import { useAuth } from "@/app/middlewares/useAuth";
import { parseCookies } from "nookies";

interface Message {
  userId: string;
  name: string;
  message: string;
}

export default function Chatear() {
  const [chat, setChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const isLoggedIn = useAuth();

  const cookies = parseCookies();
  const token = cookies.accessToken;

  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<UsersResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // const roomId = [storedUserId, rec  ipientId].sort().join("_");

  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const storedName =
    typeof window !== "undefined" ? localStorage.getItem("userName") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allUserListService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (
      !isLoggedIn ||
      !storedUserId ||
      !storedName ||
      !token ||
      socketRef.current
    )
      return;

    const newSocket = initializeSocket(storedUserId, storedName, token);
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Socket conectado:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket desconectado.");
      setIsConnected(false);
    });

    newSocket.on("receiveMessage", (message: Message) => {
      console.log("📩 Mensaje recibido:", message);

      setMessages((prevMessages) => ({
        ...prevMessages,
        [message.userId]: [...(prevMessages[message.userId] || []), message],
      }));

      setLastMessage(message);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!socketRef.current || !recipientId.trim()) return;

    console.log(`🔗 Uniéndose a la sala con ${recipientId}`);
    socketRef.current.emit("joinRoom", { userId: storedUserId, recipientId });
  }, [recipientId]);

  const sendMessage = useCallback(() => {
    if (!recipientId.trim() || !message.trim() || !socketRef.current) {
      console.warn("⚠️ No se puede enviar el mensaje. Datos faltantes.");
      return;
    }

    const roomId = [storedUserId, recipientId].sort().join("_"); // Mismo ID de sala para ambos

    const newMessage: Message = {
      userId: storedUserId || "Tu",
      name: storedName || "Tú",
      message,
    };

    console.log("📤 Enviando mensaje:", newMessage);

    socketRef.current.emit("sendMessage", {
      roomId, // Ahora enviamos el mensaje a la sala correcta
      userId: storedUserId,
      recipientId,
      message,
    });

    setMessages((prevMessages) => ({
      ...prevMessages,
      [recipientId]: [...(prevMessages[recipientId] || []), newMessage],
    }));

    setMessage("");
  }, [recipientId, message, storedUserId, storedName]);

  const ListUser = useMemo(
    () => data.map((element) => ({ value: element._id, label: element.name })),
    [data]
  );

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="relative border border-gray-400 p-1 rounded-md">
      <div className="relative inline-block">
        {unreadMessages > 0 && (
          <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {unreadMessages}
          </div>
        )}
        <Button
          onClick={() => {
            setChat(!chat);
            setUnreadMessages(0);
          }}
        >
          Citofonía
        </Button>
      </div>

      {chat && (
        <div className="absolute right-4 bg-white p-2 rounded shadow-lg w-64 h-80 overflow-auto z-50">
          <div className="text-gray-700 font-bold text-sm mb-2">
            Mensajes no leídos: {unreadMessages}
          </div>
          <div
            className={`text-sm font-bold ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Conectado" : "No conectado"}
          </div>

          <SelectField
            className="mt-1 mb-2"
            id="rol"
            defaultOption="Selecciona un usuario"
            value={recipientId}
            options={ListUser}
            inputSize="md"
            rounded="lg"
            onChange={(e) => setRecipientId(e.target.value)}
          />

          <div className="max-h-48 overflow-auto border rounded p-2 bg-gray-100">
            {messages[recipientId]?.length > 0 ? (
              messages[recipientId].map((msg, index) => (
                <div key={index} className="p-1 border-b text-sm">
                  <Text size="sm" font="bold">
                    {msg.name}:
                  </Text>
                  <Text size="sm">{msg.message}</Text>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center">
                No hay mensajes
              </p>
            )}
          </div>

          {/* Último mensaje recibido */}
          <div className="mt-2 border-t pt-2">
            <Text size="sm" font="bold">
              Mensaje que recibo:
            </Text>
            <Text size="sm" className="text-blue-600">
              {lastMessage
                ? `${lastMessage.name}: ${lastMessage.message}`
                : "Ninguno"}
            </Text>
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-1 border rounded mb-2 text-sm"
            />
            <Button onClick={sendMessage} className="w-full">
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
