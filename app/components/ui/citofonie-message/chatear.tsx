/* eslint-disable react-hooks/exhaustive-deps */
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
import { Socket } from "socket.io-client";
import { initializeSocket } from "./socket";
import { allUserListService } from "./services/userlistSerive";
import { UsersResponse } from "@/app/(panel)/my-new-user/services/response/usersResponse";
import { useAuth } from "@/app/middlewares/useAuth";
import { parseCookies } from "nookies";
import { AiOutlineWechat } from "react-icons/ai";
import SidebarInformation from "../sidebar-information";

// Mensaje recibido del servidor (no incluye roomId)
interface ReceivedMessage {
  userId: string;
  name: string;
  message: string;
}

interface Message {
  roomId: string;
  userId: string;
  name: string;
  message: string;
}

export default function Chatear() {
  const [chat, setChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>({});
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const isLoggedIn = useAuth();

  const { accessToken: token } = parseCookies();

  const [recipientId, setRecipientId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [data, setData] = useState<UsersResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const storedUserId =
    (typeof window !== "undefined" ? localStorage.getItem("userId") : null) ||
    "";
  const storedName =
    (typeof window !== "undefined" ? localStorage.getItem("userName") : null) ||
    "";
  const storedRol =
    (typeof window !== "undefined" ? localStorage.getItem("rolName") : null) ||
    "";

  // Carga lista de usuarios
  useEffect(() => {
    allUserListService()
      .then(setData)
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });
  }, []);

  const socketRef = useRef<Socket | null>(null);

  // Conexión y listener único
  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !token) return;
    if (socketRef.current) return;

    const socket = initializeSocket(storedUserId, storedName, token);
    socketRef.current = socket;
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    const handleReceive = (msg: ReceivedMessage) => {
      // Calcula roomId según emisor y receptor
      const roomId = [msg.userId, storedUserId].sort().join("_");
      const fullMsg: Message = { ...msg, roomId };

      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), fullMsg],
      }));
      setLastMessage(fullMsg);
      if (msg.userId !== storedUserId) {
        setChat(true);
        setUnreadMessages((u) => u + 1);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, storedUserId, storedName, token]);

  // Unirse a sala al cambiar destinatario
  useEffect(() => {
    if (!socketRef.current || !storedUserId || !recipientId) return;
    // const roomId = [storedUserId, recipientId].sort().join("_");
    socketRef.current.emit("joinRoom", { userId: storedUserId, recipientId });

    // Opcional: cargar historial de roomId
  }, [recipientId, storedUserId]);

  // Envía mensaje
  const sendMessage = useCallback(() => {
    if (
      !recipientId.trim() ||
      !messageText.trim() ||
      !socketRef.current ||
      !isConnected
    )
      return;

    const roomId = [storedUserId, recipientId].sort().join("_");
    const payload = {
      userId: storedUserId,
      recipientId,
      roomId,
      message: messageText,
    };
    socketRef.current.emit("sendMessage", payload);

    const fullMsg: Message = {
      ...payload,
      name: storedName || "Tú",
    };
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), fullMsg],
    }));
    setMessageText("");
  }, [recipientId, messageText, storedUserId, storedName, isConnected]);

  const ListUser = useMemo(() => {
    const users =
      storedRol === "useradmin"
        ? data.filter((u) => u.rol === "porteria")
        : data;
    return users.map((u) => ({ value: u._id, label: u.name }));
  }, [data, storedRol]);

  if (error) return <div>{error}</div>;

  const { valueState } = SidebarInformation();
  const { userRolName } = valueState;
  const currentRoom =
    storedUserId && recipientId
      ? [storedUserId, recipientId].sort().join("_")
      : null;

  return (
    <div className="relative p-1 rounded-md">
      {userRolName !== "user" && (
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
      )}

      {chat && (
        <div className="absolute left-4 p-2 rounded shadow-lg w-96 h-96 overflow-auto z-50 bg-white">
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

          <div className="max-h-96 overflow-auto border rounded p-2 bg-gray-100">
            {currentRoom && messages[currentRoom]?.length > 0 ? (
              messages[currentRoom].map((msg, idx) => (
                <div key={idx} className="p-1 border-b text-sm">
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

          <div className="mt-2 border-t pt-2">
            <Text size="sm" font="bold">
              Ultimo mensaje:
            </Text>
            <Text size="sm" font="semi" colVariant="success">
              {lastMessage?.message || ""}
            </Text>
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
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
