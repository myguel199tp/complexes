/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Buton,
  Button,
  Modal,
  InputField,
  Text,
  Tooltip,
  Avatar,
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
import { useAuth } from "@/app/middlewares/useAuth";
import { parseCookies } from "nookies";
import { AiOutlineWechat } from "react-icons/ai";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "../sidebar-information";
import { IoIosImages } from "react-icons/io";
import { FaCameraRetro } from "react-icons/fa6";
import { FaPlusCircle } from "react-icons/fa";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

interface Message {
  id?: string;
  tempId?: string;
  roomId: string;
  senderId: string;
  recipientId?: string;
  conjuntoId: string;
  name: string;
  message: string | null;
  imageUrl?: string | null;
  createdAt?: string | Date;
}

/** incoming shape que enviará el servidor (normalizamos variantes) */
interface IncomingRaw {
  id?: string;
  tempId?: string;
  senderId?: string;
  recipientId?: string;
  conjuntoId?: string;
  message?: string | null;
  imageUrl?: string | null;
  imageUrlPath?: string;
  createdAt?: string;
  name?: string;
  sender?: { id?: string; userId?: string; name?: string };
  recipient?: { id?: string; userId?: string };
  conjunto?: { id?: string };
  senderName?: string;
}

export default function Chatear(): JSX.Element {
  const payload = getTokenPayload();
  const { valueState } = useSidebarInformation();
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [chat, setChat] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {}
  );
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const isLoggedIn = useAuth();
  const { accessToken: token } = parseCookies();

  const [recipientId, setRecipientId] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const storedUserId = payload?.id || "";
  const storedName = payload?.name || "";

  const currentRoom: string | null =
    storedUserId && recipientId && infoConjunto
      ? [storedUserId, recipientId, infoConjunto].sort().join("_")
      : null;

  const [showImage, setShowImage] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll al final cuando cambian los mensajes del room activo
  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (!currentRoom) return;
    const roomMsgs = messages[currentRoom];
    if (!roomMsgs || roomMsgs.length === 0) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  }, [messages, currentRoom]);

  // Cargar lista de usuarios
  useEffect(() => {
    allUserListService(infoConjunto)
      .then(setData)
      .catch((err: unknown) => {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });
  }, [infoConjunto]);

  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !token) return;
    if (socketRef.current) return;

    const socket = initializeSocket(storedUserId, storedName);
    socketRef.current = socket;

    socket.onAny((event: string, ...args: unknown[]) => {
      console.log("🔸 socket event:", event, args);
    });

    socket.on("connect", () => {
      console.log("🔌 socket connected, id:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("🔌 socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("⚠️ connect_error:", err);
    });

    const normalizeIncoming = (raw: IncomingRaw): Message | null => {
      const senderId = raw.senderId ?? raw.sender?.id ?? raw.sender?.userId;
      const recipientId =
        raw.recipientId ?? raw.recipient?.id ?? raw.recipient?.userId;
      const conjuntoId = raw.conjuntoId ?? raw.conjunto?.id ?? infoConjunto;
      if (!senderId || !recipientId) return null;
      const roomId = [senderId, recipientId, conjuntoId].sort().join("_");
      return {
        id: raw.id ?? undefined,
        tempId: raw.tempId ?? undefined,
        roomId,
        senderId: String(senderId),
        recipientId: String(recipientId),
        conjuntoId: String(conjuntoId),
        name: raw.name ?? raw.sender?.name ?? raw.senderName ?? "Desconocido",
        message: raw.message ?? null,
        imageUrl: raw.imageUrl ?? raw.imageUrlPath ?? null,
        createdAt: raw.createdAt ?? new Date().toISOString(),
      };
    };

    const handleReceive = (raw: IncomingRaw) => {
      const full = normalizeIncoming(raw);
      if (!full) {
        console.warn(
          "receiveMessage: incoming no tiene sender/recipient:",
          raw
        );
        return;
      }

      console.log("📩 receiveMessage normalized:", full);

      setMessages((prev) => {
        const prevRoomMsgs: Message[] = prev[full.roomId]
          ? [...prev[full.roomId]]
          : [];

        // Si viene id y tempId -> reemplazar optimistic por persisted
        if (full.id) {
          if (full.tempId) {
            const idx = prevRoomMsgs.findIndex((m) => m.tempId === full.tempId);
            if (idx !== -1) {
              prevRoomMsgs[idx] = { ...full };
              return { ...prev, [full.roomId]: prevRoomMsgs };
            }
          }

          // Evitar duplicados por id
          const exists = prevRoomMsgs.some((m) => m.id === full.id);
          if (exists) return prev;

          // Añadir al final
          return { ...prev, [full.roomId]: [...prevRoomMsgs, full] };
        } else {
          // Mensaje sin id (otro cliente, optimista) -> añadir
          prevRoomMsgs.push(full);
          return { ...prev, [full.roomId]: prevRoomMsgs };
        }
      });

      // Si el mensaje viene de otro usuario: abrir y marcar no leído
      if (full.senderId !== storedUserId) {
        setChat(true);
        setRecipientId(full.senderId);
        setUnreadMessages((prev) => ({
          ...prev,
          [full.roomId]: (prev[full.roomId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handleReceive);

    socket.on("notification", (n: unknown) => {
      console.log("🔔 notification recibido:", n);
    });
    socket.on("newMessageInConjunto", (n: unknown) => {
      console.log("🏘️ newMessageInConjunto:", n);
    });

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.off("receiveMessage", handleReceive);
          socketRef.current.off("notification");
          socketRef.current.off("newMessageInConjunto");
          if (
            typeof (socketRef.current as unknown as Record<string, unknown>)
              .offAny === "function"
          ) {
            (socketRef.current as unknown as { offAny: () => void }).offAny();
          }
          socketRef.current.disconnect();
        } catch (e) {
          console.warn("Error cleaning socket listeners", e);
        }
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, storedUserId, storedName, token, infoConjunto, recipientId]);

  // joinRoomAndWait: espera evento 'joinedRoom' o hace fallback a timeout
  const joinRoomAndWait = useCallback(
    (
      roomId: string,
      payloadJoin: { senderId: string; recipientId: string; conjuntoId: string }
    ) => {
      return new Promise<void>((resolve) => {
        const socket = socketRef.current;
        if (!socket) return resolve();

        if (joinedRoomsRef.current.has(roomId)) return resolve();

        const onJoined = (data: { roomId?: string }) => {
          if (data?.roomId === roomId) {
            joinedRoomsRef.current.add(roomId);
            socket.off("joinedRoom", onJoined);
            return resolve();
          }
        };

        socket.once("joinedRoom", onJoined);

        socket.emit("joinRoom", payloadJoin, (_ack: string) => {
          // ack recibido (opcional)
        });

        // fallback timeout
        const to = setTimeout(() => {
          if (!joinedRoomsRef.current.has(roomId)) {
            joinedRoomsRef.current.add(roomId);
          }
          socket.off("joinedRoom", onJoined);
          clearTimeout(to);
          resolve();
        }, 1000);
      });
    },
    []
  );

  useEffect(() => {
    if (!socketRef.current || !storedUserId || !recipientId || !infoConjunto)
      return;
    const roomId = [storedUserId, recipientId, infoConjunto].sort().join("_");
    joinedRoomsRef.current.add(roomId);
    // reset unread
    setUnreadMessages((prev) => ({ ...prev, [roomId]: 0 }));
  }, [recipientId, storedUserId, infoConjunto]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Error al subir imagen");
    const data = await res.json();
    return String((data as { url?: string }).url ?? "");
  };

  const sendMessage = useCallback(async () => {
    if (
      !recipientId.trim() ||
      (!messageText.trim() && !imageFile) ||
      !socketRef.current ||
      !isConnected
    ) {
      return;
    }

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("❌ Error subiendo imagen:", err);
        return;
      }
    }

    const roomId = [storedUserId, recipientId, infoConjunto].sort().join("_");

    // Generar tempId
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Asegurar join
    await joinRoomAndWait(roomId, {
      senderId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto,
    });

    // payload con tempId
    const payload = {
      senderId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto,
      message: messageText || null,
      imageUrl: imageUrl || null,
      tempId,
    };

    console.log("📤 Enviando mensaje al socket:", payload);

    socketRef.current.emit("sendMessage", payload, (ack: string) => {
      console.log("📥 ACK del servidor:", ack);
    });

    // Optimistic update
    const fullMsg: Message = {
      tempId,
      roomId,
      senderId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto,
      name: storedName || "Tú",
      message: messageText || null,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      const prevRoomMsgs = prev[roomId] ? [...prev[roomId]] : [];
      return { ...prev, [roomId]: [...prevRoomMsgs, fullMsg] };
    });

    setMessageText("");
    setImageFile(null);
    setImagePreview(null);
  }, [
    recipientId,
    messageText,
    imageFile,
    storedUserId,
    storedName,
    isConnected,
    infoConjunto,
    joinRoomAndWait,
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const ListUser = useMemo(() => {
    return data
      .filter((u) => !(u.role === "owner" && u.isMainResidence === false))
      .map((u) => ({
        value: u.user.id,
        label: u.user?.name ?? "Sin nombre",
        apto: u.apartment,
        imgapt: u.user.file,
      }));
  }, [data]);

  const [filterText, setFilterText] = useState<string>("");
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  if (error) return <div>{error}</div>;
  const { userRolName } = valueState;

  return (
    <div className="relative p-1 rounded-md ">
      {userRolName !== "user" && (
        <div className="relative inline-block w-10">
          {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
            <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
            </div>
          )}
          <Button
            size="sm"
            rounded="lg"
            className="bg-gray-200"
            onClick={() => {
              setChat(!chat);
              if (currentRoom)
                setUnreadMessages((prev) => ({ ...prev, [currentRoom]: 0 }));
            }}
          >
            <Tooltip className="bg-gray-500" content="Chat" position="bottom">
              <AiOutlineWechat className="text-cyan-800" size={30} />
            </Tooltip>
          </Button>
        </div>
      )}

      {chat && (
        <Modal
          isOpen
          onClose={() => setChat(false)}
          className="w-[1800px] h-[680px]"
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-bold text-sm">
                Mensajes no leídos:{" "}
                {currentRoom ? unreadMessages[currentRoom] || 0 : 0}
              </div>
            </div>

            <div
              className={`text-sm font-bold ${
                isConnected ? "text-green-600" : "text-red-600"
              } mb-2`}
            >
              {isConnected ? "Conectado" : "No conectado"}
            </div>

            <section className="flex w-full mt-4 gap-4">
              <div className="w-1/4 border-r pr-2 overflow-y-auto">
                <InputField
                  placeholder="Buscar"
                  helpText="Buscar"
                  value={filterText}
                  sizeHelp="sm"
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
                <div className="h-[320px] overflow-y-auto">
                  <ul className="space-y-2 mt-2">
                    {ListUser.filter((u) =>
                      `${u.label} ${u.apto}`
                        .toLowerCase()
                        .includes(filterText?.toLowerCase())
                    ).map((u) => {
                      const roomId = [storedUserId, u.value, infoConjunto]
                        .sort()
                        .join("_");
                      const unreadCount = unreadMessages[roomId] || 0;
                      return (
                        <li key={u.value}>
                          <button
                            onClick={() => setRecipientId(u.value)}
                            className={`relative w-full text-left px-3 py-2 rounded-md transition ${
                              recipientId === u.value
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <div className="flex gap-4 items-center">
                              <Avatar
                                src={`${BASE_URL}/uploads/${u.imgapt.replace(
                                  /^.*[\\/]/,
                                  ""
                                )}`}
                                alt={`${u.label}`}
                                size="md"
                                border="thick"
                                shape="round"
                              />
                              <div>
                                <Text size="sm">{u.label}</Text>
                                {u.apto !== "" && (
                                  <Text size="sm" font="bold">
                                    Inmueble: {u.apto}
                                  </Text>
                                )}
                              </div>
                            </div>

                            {unreadCount > 0 && (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="flex-1">
                {imagePreview ? (
                  <div className="w-full h-[300px] overflow-auto items-center justify-center rounded p-2 border border-gray-500 mb-2">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-auto rounded p-2 border border-gray-500 mb-2">
                    {currentRoom && messages[currentRoom]?.length > 0 ? (
                      <>
                        {messages[currentRoom].map((msg) => (
                          <div
                            key={
                              msg.id ??
                              msg.tempId ??
                              `${msg.roomId}-${Math.random()}`
                            }
                            className="p-1 border-b text-sm"
                          >
                            <Text size="sm" font="bold">
                              {msg.name}
                            </Text>
                            {msg.message && (
                              <Text size="sm">{msg.message}</Text>
                            )}
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="imagen"
                                className="object-cover rounded mt-1"
                              />
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <Text className="text-xs text-gray-500 text-center">
                        No hay mensajes
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </section>

            {showImage && (
              <div className="flex gap-8 border border-gray-200 p-4 rounded-sm">
                <div onClick={handleClick} className="cursor-pointer">
                  <IoIosImages size={40} />
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <FaCameraRetro size={35} />
              </div>
            )}

            <div className="flex mt-2 gap-2 bg-gray-200 p-4">
              <FaPlusCircle
                size={40}
                color="gray"
                onClick={() => setShowImage(!showImage)}
              />
              <InputField
                type="text"
                rounded="md"
                placeholder="Escribe un mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              {(messageText || imageFile) && (
                <Buton onClick={sendMessage} borderWidth="thin" rounded="lg">
                  Enviar
                </Buton>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
