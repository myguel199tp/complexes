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
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

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
  const payload = getTokenPayload();

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
    (typeof window !== "undefined" ? payload?.id : null) || "";
  const storedName =
    (typeof window !== "undefined" ? payload?.name : null) || "";
  const storedRol =
    (typeof window !== "undefined" ? payload?.role : null) || "";

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

  // Conexión y listeners
  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !token) return;
    if (socketRef.current) return;

    const socket = initializeSocket(storedUserId, storedName, token);
    socketRef.current = socket;
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Mensajes entrantes
    const handleReceive = (msg: ReceivedMessage) => {
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

    // Resultado test WhatsApp
    socket.on("testResult", (res) => {
      console.log("✅ testWhatsApp result:", res);
    });

    socket.on("testWhatsApp", () => {
      // lógica para probar WhatsApp
      socket.emit("testResult", { success: true });
    });

    // Resultado llamada
    socket.on("callInitiated", (sid: string) => {
      console.log("📞 callInitiated SID:", sid);
    });

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("testResult");
      socket.off("callInitiated");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, storedUserId, storedName, token]);

  // Unirse a sala al cambiar destinatario
  useEffect(() => {
    if (!socketRef.current || !storedUserId || !recipientId) return;
    socketRef.current.emit("joinRoom", { userId: storedUserId, recipientId });
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

    const fullMsg: Message = { ...payload, name: storedName || "Tú" };
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), fullMsg],
    }));
    setMessageText("");
  }, [recipientId, messageText, storedUserId, storedName, isConnected]);

  // Prueba WhatsApp
  const testWhatsApp = () => {
    console.log("🔍 Probar WhatsApp clicked");

    if (!socketRef.current) {
      console.error("❌ No socket connection");
      return;
    }

    if (!isConnected) {
      console.error("❌ Socket no conectado aún");
      return;
    }

    console.log("🟢 Emitiendo evento testWhatsApp");
    socketRef.current.emit("testWhatsApp");
  };

  const sendComplet = () => {
    sendMessage();
    testWhatsApp();
  };

  // Iniciar llamada de voz
  const callByVoice = () => {
    // reemplaza con el teléfono que quieras llamar
    socketRef.current?.emit("makeCall", { to: "+573001234567" });
  };

  const ListUser = useMemo(() => {
    const users =
      storedRol === "employee"
        ? data.filter((u) => u.role === "employee")
        : data;
    return users.map((u) => ({ value: u.id, label: u.name }));
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
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-700 font-bold text-sm">
              Mensajes no leídos: {unreadMessages}
            </div>
          </div>

          {/* Estado conexión */}
          <div
            className={`text-sm font-bold ${
              isConnected ? "text-green-600" : "text-red-600"
            } mb-2`}
          >
            {isConnected ? "Conectado" : "No conectado"}
          </div>

          {/* Select usuario */}
          <SelectField
            className="mt-1 mb-2"
            id="role"
            defaultOption="Selecciona un usuario"
            value={recipientId}
            options={ListUser}
            inputSize="md"
            rounded="lg"
            onChange={(e) => setRecipientId(e.target.value)}
          />

          {/* Chat */}
          <div className="max-h-56 overflow-auto border rounded p-2 bg-gray-100 mb-2">
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

          {/* Último mensaje */}
          <div className="mt-2 border-t pt-2 mb-2">
            <Text size="sm" font="bold">
              Último mensaje:
            </Text>
            <Text size="sm" font="semi" colVariant="success">
              {lastMessage?.message || ""}
            </Text>
          </div>

          {/* Input y enviar */}
          <div className="mt-2 flex">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 p-1 border rounded text-sm mr-2"
            />
            <Button onClick={sendComplet} rounded="lg">
              Enviar
            </Button>
          </div>
          <div className="mt-2">
            {/* <Button size="sm" onClick={testWhatsApp} className="mr-2">
                Probar WhatsApp
              </Button> */}
            <Button size="sm" onClick={callByVoice}>
              Llamar por voz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
