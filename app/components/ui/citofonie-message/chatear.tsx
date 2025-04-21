"use client";

import {
  Buton,
  Button,
  SelectField,
  Text,
  Tooltip,
} from "complexes-next-components";
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
import { AiOutlineWechat } from "react-icons/ai";

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
  const storedRol =
    typeof window !== "undefined" ? localStorage.getItem("rolName") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allUserListService();
        setData(result);
      } catch (err) {
        console.error("Error al obtener la lista de usuarios:", err);
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

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("receiveMessage", (message: Message) => {
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
  }, [isLoggedIn, token, storedUserId, storedName]);

  useEffect(() => {
    if (!socketRef.current || !recipientId.trim()) return;

    console.log(`🔗 Uniéndose a la sala con ${recipientId}`);
    socketRef.current.emit("joinRoom", { userId: storedUserId, recipientId });
  }, [recipientId]);

  useEffect(() => {
    if (lastMessage && lastMessage.userId !== storedUserId) {
      setChat(true); // Abre el chat si llega un mensaje de otro usuario
      setUnreadMessages((prev) => prev + 1);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("receiveMessage", (message: Message) => {
      // Verifica si el mensaje es para el usuario actual
      if (message.userId !== storedUserId) {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [message.userId]: [...(prevMessages[message.userId] || []), message],
        }));

        setLastMessage(message);
        setChat(true); // Abre el chat si llega un mensaje nuevo
        setUnreadMessages((prev) => prev + 1);
      }
    });

    return () => {
      socketRef.current?.off("receiveMessage");
    };
  }, [storedUserId]);

  const sendMessage = useCallback(() => {
    if (
      !recipientId.trim() ||
      !message.trim() ||
      !socketRef.current ||
      !isConnected
    ) {
      console.warn(
        "⚠️ No se puede enviar el mensaje. Datos faltantes o conexión perdida."
      );
      return;
    }

    const roomId = [storedUserId, recipientId].sort().join("_");

    const newMessage: Message = {
      userId: storedUserId || "Tu",
      name: storedName ?? lastMessage?.name ?? "Tú",
      message,
    };

    socketRef.current.emit("sendMessage", {
      roomId,
      userId: storedUserId,
      recipientId,
      message,
    });

    setMessages((prevMessages) => ({
      ...prevMessages,
      [recipientId]: [...(prevMessages[recipientId] || []), newMessage],
    }));

    setMessage("");
  }, [recipientId, message, storedUserId, storedName, isConnected]);

  const ListUser = useMemo(() => {
    if (storedRol === "useradmin") {
      return data
        .filter((element) => element.rol === "porteria")
        .map((element) => ({ value: element._id, label: element.name }));
    }
    return data.map((element) => ({ value: element._id, label: element.name }));
  }, [data, storedRol]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="relative p-1 rounded-md">
      <div className="relative inline-block w-10">
        {unreadMessages > 0 && (
          <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {unreadMessages}
          </div>
        )}
        <Buton
          size="sm"
          rounded="lg"
          onClick={() => {
            setChat(!chat);
            setUnreadMessages(0);
          }}
        >
          <Tooltip content="mensajes" position="bottom">
            <AiOutlineWechat color="gray" size={30} />
          </Tooltip>
        </Buton>
      </div>

      {chat && (
        <div className="absolute left-4 p-2 rounded shadow-lg w-64 h-80 overflow-auto z-50 bg-white">
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
                    {msg.name}
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
              Ultimo mensaje en conversación:
            </Text>
            <Text size="sm" font="semi" colVariant="success">
              {lastMessage ? `${lastMessage.message}` : ""}
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
            <Button onClick={sendMessage} className="w-full" rounded="lg">
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
