/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { IoIosImages } from "react-icons/io";
import { FaCameraRetro } from "react-icons/fa6";
import { FaPlusCircle } from "react-icons/fa";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { GrAnnounce } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { IoSearchCircle } from "react-icons/io5";
import { chatMessageService } from "./services/chatServices";
import { useLanguage } from "@/app/hooks/useLanguage";

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

interface NewMessageInConjuntoPayload {
  conjuntoId: string | number;
  from?: string | number | null;
  message?: string | null;
  imageUrl?: string | null;
  broadcast?: boolean;
}

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
  const userRolName = useConjuntoStore((state) => state.role);

  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [broadcastAll, setBroadcastAll] = useState<boolean>(false);

  const [chat, setChat] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {},
  );
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const isLoggedIn = useAuth();
  const { accessToken: token } = parseCookies();

  const [recipientId, setRecipientId] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [pagination] = useState({
    limit: 1000,
  });
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const storedUserId = useConjuntoStore((state) => state.userId);
  const storedName = useConjuntoStore((state) => state.nameUser);

  const currentRoom: string | null =
    storedUserId && recipientId && infoConjunto
      ? [storedUserId, recipientId, infoConjunto].sort().join("_")
      : null;

  const broadcastRoom = `conjunto:${infoConjunto}`;
  const activeRoom: string | null = broadcastAll ? broadcastRoom : currentRoom;

  const [showImage, setShowImage] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (!activeRoom) return;
    const roomMsgs = messages[activeRoom];
    if (!roomMsgs || roomMsgs.length === 0) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  }, [messages, activeRoom]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(blob));
        closeCamera();
      }
    }, "image/jpeg");
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  useEffect(() => {
    if (!infoConjunto) return;

    const loadUsers = async () => {
      try {
        const res = await allUserListService(infoConjunto, 1, 1000);

        setData(res.data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    loadUsers();
  }, [infoConjunto, pagination.limit]);
  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !token) return;
    if (socketRef.current) return;

    const socket = initializeSocket(storedUserId, storedName);
    socketRef.current = socket;

    socket.onAny((event: string, ...args: unknown[]) => {
      console.log("🔸 socket event:", event, args);
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", (reason: string) => {
      console.warn("🔌 socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("⚠️ connect_error:", err);
    });

    socket.on("broadcastError", (payload: string) => {
      console.error("🔴 broadcastError recibido:", payload);
    });

    socket.on("joinedRoom", (data: string) => {
      console.log("🔔 joinedRoom evento (cliente):", data);
    });

    socket.on(
      "newMessageInConjunto",
      (payload: NewMessageInConjuntoPayload) => {
        try {
          const {
            conjuntoId: cid,
            from,
            message,
            imageUrl,
            broadcast,
          } = payload;

          if (broadcast && String(cid) === String(infoConjunto)) {
            const room = broadcastRoom;

            const pseudo: Message = {
              tempId: `nmic-${Date.now()}`,
              roomId: room,
              senderId: String(from ?? "system"),
              recipientId: "broadcast",
              conjuntoId: String(cid),
              name: "Difusión",
              message: message ?? null,
              imageUrl: imageUrl ?? null,
              createdAt: new Date().toISOString(),
            };

            setMessages((prev) => {
              const prevRoomMsgs = prev[room] ? [...prev[room]] : [];
              return { ...prev, [room]: [...prevRoomMsgs, pseudo] };
            });
          }
        } catch (e) {
          console.warn("Error procesando newMessageInConjunto", e);
        }
      },
    );

    const normalizeIncoming = (raw: IncomingRaw): Message | null => {
      const senderId = raw.senderId ?? raw.sender?.id ?? raw.sender?.userId;
      const recipientId =
        raw.recipientId ?? raw.recipient?.id ?? raw.recipient?.userId;
      const conjuntoId = raw.conjuntoId ?? raw.conjunto?.id ?? infoConjunto;
      if (!senderId || !recipientId) return null;
      const roomId = [senderId, recipientId, conjuntoId].sort().join("_");

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

      return {
        id: raw.id ?? undefined,
        tempId: raw.tempId ?? undefined,
        roomId,
        senderId: String(senderId),
        recipientId: String(recipientId),
        conjuntoId: String(conjuntoId),
        name: raw.name ?? raw.sender?.name ?? raw.senderName ?? "Desconocido",
        message: raw.message ?? null,
        imageUrl: raw.imageUrl?.startsWith("http")
          ? raw.imageUrl
          : raw.imageUrl
            ? `${BASE_URL}/${raw.imageUrl.replace(/^\//, "")}`
            : raw.imageUrlPath
              ? `${BASE_URL}/${raw.imageUrlPath.replace(/^\//, "")}`
              : null,
        createdAt: raw.createdAt ?? new Date().toISOString(),
      };
    };
    const handleReceive = (raw: IncomingRaw) => {
      const full = normalizeIncoming(raw);
      if (!full) {
        console.warn(
          "receiveMessage: incoming no tiene sender/recipient:",
          raw,
        );
        return;
      }

      setMessages((prev) => {
        const existing = prev[full.roomId];

        const prevRoomMsgs: Message[] = Array.isArray(existing)
          ? [...existing]
          : [];

        if (full.id) {
          if (full.tempId) {
            const idx = prevRoomMsgs.findIndex((m) => m.tempId === full.tempId);
            if (idx !== -1) {
              prevRoomMsgs[idx] = { ...full };
              return { ...prev, [full.roomId]: prevRoomMsgs };
            }
          }

          const exists = prevRoomMsgs.some((m) => m.id === full.id);
          if (exists) return prev;

          return {
            ...prev,
            [full.roomId]: [...prevRoomMsgs, full],
          };
        }

        return {
          ...prev,
          [full.roomId]: [...prevRoomMsgs, full],
        };
      });

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

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.off("receiveMessage", handleReceive);
          socketRef.current.off("notification");
          socketRef.current.off("newMessageInConjunto");
          socketRef.current.off("broadcastError");
          socketRef.current.off("joinedRoom");
          socketRef.current.offAny();
          socketRef.current.disconnect();
        } catch (e) {
          console.warn("Error cleaning socket listeners", e);
        }
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, storedUserId, storedName, token, infoConjunto, recipientId]);

  const joinRoomAndWait = useCallback(
    (
      roomId: string,
      payloadJoin: {
        senderId: string;
        recipientId: string;
        conjuntoId: string;
      },
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
          console.log(_ack);
        });

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
    [],
  );

  useEffect(() => {
    if (!storedUserId || !recipientId || !infoConjunto) {
      return;
    }

    const roomId = [storedUserId, recipientId, infoConjunto].sort().join("_");

    const fetchMessages = async () => {
      try {
        const result = await chatMessageService({
          storedUserId,
          recipientId,
          infoConjunto,
        });

        const normalized: Message[] = result.map((msg) => ({
          id: msg.id,
          tempId: msg.tempId,
          roomId,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          conjuntoId: msg.conjuntoId,
          name: msg.name,
          message: msg.message ?? null,
          imageUrl: msg.imageUrl ?? null,
          createdAt: msg.createdAt ?? new Date().toISOString(),
        }));

        setMessages((prev) => {
          const updated = {
            ...prev,
            [roomId]: normalized,
          };

          return updated;
        });
      } catch (err) {
        console.error("❌ Error cargando mensajes:", err);
      }
    };

    fetchMessages();
  }, [storedUserId, recipientId, infoConjunto]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("imageUrl", file);
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Error HTTP:", res.status, text);
      throw new Error("Error al subir imagen");
    }

    const data = await res.json();

    return data?.url;
  };

  const sendMessage = useCallback(async () => {
    if (!broadcastAll && !recipientId.trim()) return;
    if (!messageText.trim() && !imageFile) return;
    if (!socketRef.current || !isConnected) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("❌ Error subiendo imagen:", err);
        return;
      }
    }

    if (broadcastAll) {
      const payload = {
        senderId: storedUserId,
        conjuntoId: infoConjunto,
        message: messageText || null,
        imageUrl: imageUrl || null,
      };

      socketRef.current.emit("sendBroadcast", payload, (ack: string) => {
        console.log("📥 ACK broadcast (callback):", ack);
      });

      const pseudo: Message = {
        tempId: `broadcast-temp-${Date.now()}`,
        roomId: broadcastRoom,
        senderId: storedUserId,
        recipientId: "broadcast",
        conjuntoId: infoConjunto,
        name: storedName || "Tú (a todos)",
        message: messageText || null,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const prevRoomMsgs = prev[broadcastRoom]
          ? [...prev[broadcastRoom]]
          : [];
        return { ...prev, [broadcastRoom]: [...prevRoomMsgs, pseudo] };
      });

      setMessageText("");
      setImageFile(null);
      setImagePreview(null);
      setRecipientId("");
      return;
    }

    const roomId = [storedUserId, recipientId, infoConjunto].sort().join("_");

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    await joinRoomAndWait(roomId, {
      senderId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto,
    });

    const payload = {
      senderId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto,
      message: messageText || null,
      imageUrl: imageUrl || null,
      tempId,
    };

    socketRef.current.emit("sendMessage", payload, (ack: string) => {
      console.log("📥 ACK del servidor:", ack);
    });

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
    broadcastAll,
    recipientId,
    messageText,
    imageFile,
    storedUserId,
    storedName,
    isConnected,
    infoConjunto,
    joinRoomAndWait,
    broadcastRoom,
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
    if (!Array.isArray(data)) return [];

    return data
      .filter((u) => !(u.role === "owner" && u.isMainResidence === false))
      .map((u) => ({
        value: u.user.id,
        label: u.user?.name ?? "Invitado",
        apto: u.apartment,
        torr: u.tower,
        imgapt: u.user.file,
      }));
  }, [data]);

  const [filterText, setFilterText] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  if (error) return <div>{error}</div>;

  return (
    <div key={language} className="relative p-1 rounded-md">
      {" "}
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
              <AiOutlineWechat className="text-cyan-800" size={20} />
            </Tooltip>
          </Button>
        </div>
      )}
      {chat && (
        <div className="fixed inset-0 z-[999999]">
          <Modal
            isOpen
            onClose={() => setChat(false)}
            className="
            w-full
            max-w-[1300px]
            h-[92vh]
            p-4
            overflow-hidden
            z-[99999]
            bg-white/10
            backdrop-blur-2xl
            border
            border-white/20
            shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            rounded-3xl
  "
          >
            <div className="flex  justify-between items-center mb-2">
              <div
                className={`text-sm font-bold ${
                  isConnected ? "text-green-600" : "text-red-600"
                } mb-2`}
              >
                {isConnected ? `${t("conectado")}` : `${t("noconectado")}`}
              </div>
              <Text size="xs" font="bold" colVariant="on">
                Mensajes no leidos{" "}
                {currentRoom ? unreadMessages[currentRoom] || 0 : 0}
              </Text>
            </div>

            <section className="flex flex-col md:flex-row w-full mt-4 gap-4 h-auto">
              <div
                className="
    w-full
    md:w-[320px]
    bg-white/5
    backdrop-blur-xl
    border
    border-white/10
    rounded-2xl
    p-3
  "
              >
                {" "}
                <div className="relative mb-4">
                  <IoSearchCircle
                    size={22}
                    className="absolute left-3 top-3 text-cyan-400"
                  />
                  <InputField
                    tKeyPlaceholder={t("buscarNoticia")}
                    placeholder="Buscar"
                    value={filterText}
                    sizeHelp="sm"
                    onChange={(e) => setFilterText(e.target.value)}
                    inputSize="sm"
                    className="
    pl-10
    bg-white/10
    backdrop-blur-lg
    border
    border-white/20
    rounded-xl
  "
                  />
                </div>
                <div className="h-[320px] overflow-y-auto custom-scroll">
                  <ul className="space-y-2 mt-2">
                    {ListUser.filter((u) =>
                      `${u.label} ${u.apto}`
                        .toLowerCase()
                        .includes(filterText?.toLowerCase()),
                    ).map((u) => {
                      const roomId = [storedUserId, u.value, infoConjunto]
                        .sort()
                        .join("_");
                      const unreadCount = unreadMessages[roomId] || 0;
                      return (
                        <li key={u.value}>
                          <button
                            onClick={() => setRecipientId(u.value)}
                            className={`
relative
w-full
text-left
px-4
py-3
rounded-2xl
transition-all
duration-300
border
${
  recipientId === u.value
    ? `
      bg-cyan-500/20
      border-cyan-400
      shadow-lg
      shadow-cyan-500/20
    `
    : `
      bg-white/5
      border-white/10
      hover:bg-white/10
    `
}
`}
                            disabled={broadcastAll}
                          >
                            <div className="flex gap-4 items-center">
                              <Avatar
                                src={
                                  u.imgapt
                                    ? `${BASE_URL}/uploads/${u.imgapt.replace(
                                        /^.*[\\/]/,
                                        "",
                                      )}`
                                    : `${BASE_URL}/uploads/default.png`
                                }
                                alt={u.label || "Avatar"}
                                size="md"
                                border="thick"
                                shape="round"
                              />
                              <div>
                                <Text size="sm">{u.label}</Text>
                                {u.apto !== "" && (
                                  <Text size="sm" font="bold">
                                    {u.torr}-{u.apto}
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
                  <div
                    className="w-full h-[300px] overflow-auto items-center justify-center p-2 bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-3xl mb-2"
                  >
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-w-[200px] object-cover rounded"
                    />
                    <Button
                      size="sm"
                      tKey={t("quitar")}
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <div
                    className="
                      h-[60vh]
                      overflow-y-auto
                      custom-scroll
                      rounded-3xl
                      p-4
                      border
                      border-white/10
                      backdrop-blur-xl
                      bg-black/20
                    "
                    style={{
                      background:
                        "linear-gradient(135deg,#0f172a,#1e293b,#0f172a)",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {activeRoom && messages[activeRoom]?.length > 0 ? (
                      <>
                        {messages[activeRoom].map((msg) => {
                          const isOwn = msg.senderId === storedUserId;

                          return (
                            <div
                              key={
                                msg.id ??
                                msg.tempId ??
                                `${msg.roomId}-${Math.random()}`
                              }
                              className={`flex mb-3 ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`flex items-end gap-2 max-w-[90%] ${
                                  isOwn ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                {/* Avatar */}
                                <img
                                  src={
                                    msg.senderId === storedUserId
                                      ? `${BASE_URL}/uploads/default.png`
                                      : `${BASE_URL}/uploads/default.png`
                                  }
                                  alt={msg.name}
                                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                                />

                                {/* Burbuja */}
                                <div
                                  className={`
            relative
            px-4
            py-2
            rounded-2xl
            shadow-md
            text-sm
            break-words
            ${
              isOwn
                ? `
                  bg-[#005c4b]
                  text-white
                  rounded-br-md
                `
                : `
                  bg-[#202c33]
                  text-white
                  rounded-bl-md
                `
            }
          `}
                                >
                                  {!isOwn && (
                                    <div className="text-cyan-400 text-[11px] font-semibold mb-1">
                                      {msg.name}
                                    </div>
                                  )}

                                  {msg.message && (
                                    <div className="text-sm leading-relaxed">
                                      {msg.message}
                                    </div>
                                  )}

                                  {msg.imageUrl && (
                                    <img
                                      src={msg.imageUrl}
                                      alt="imagen"
                                      className="
                mt-2
                rounded-xl
                max-w-[260px]
                max-h-[260px]
                object-cover
              "
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                      }}
                                    />
                                  )}

                                  <div
                                    className="
              text-[10px]
              opacity-70
              mt-1
              text-right
            "
                                  >
                                    {msg.createdAt
                                      ? new Date(
                                          msg.createdAt,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <Text
                        className="text-xs text-gray-500 text-center"
                        tKey={t("nomensajes")}
                      />
                    )}
                  </div>
                )}
              </div>
            </section>

            {showImage && (
              <div
                className="
                  flex
                  gap-8
                  mt-3
                  p-4
                  rounded-2xl
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-white/10
                "
              >
                {" "}
                <div onClick={handleClick} className="cursor-pointer">
                  <IoIosImages size={20} />
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <FaCameraRetro
                    size={20}
                    className="cursor-pointer hover:text-cyan-600"
                    onClick={openCamera}
                  />

                  {isCameraOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-[400px] h-[300px] bg-black rounded-md"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="mt-4 flex gap-4">
                        <Button
                          onClick={takePhoto}
                          className="bg-green-600 text-white"
                          tKey={t("tomarFoto")}
                        >
                          Tomar foto
                        </Button>
                        <Button
                          onClick={closeCamera}
                          className="bg-red-600 text-white"
                          tKey={t("cancelar")}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {userRolName === "employee" && (
                  <label className="flex items-center gap-2 mr-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={broadcastAll}
                      onChange={(e) => {
                        setBroadcastAll(e.target.checked);
                        if (e.target.checked) setRecipientId("");
                      }}
                      className="hidden"
                    />

                    <Tooltip
                      content="Mensaje para todos"
                      position="right"
                      className="bg-gray-200"
                    >
                      <GrAnnounce
                        size={20}
                        className={`text-2xl transition-colors duration-200 ${
                          broadcastAll ? "text-orange-600" : "text-gray-400"
                        } hover:text-orange-600`}
                      />
                    </Tooltip>
                  </label>
                )}
              </div>
            )}

            <div
              className="
    mt-4
    flex
    items-center
    gap-3
    rounded-3xl
    bg-white/10
    backdrop-blur-xl
    border
    border-white/10
    p-3
  "
            >
              {" "}
              <FaPlusCircle
                size={20}
                color="gray"
                onClick={() => setShowImage(!showImage)}
              />
              <InputField
                type="text"
                rounded="md"
                placeholder={
                  broadcastAll ? `${t("paratodos")}` : `${t("escribemensaje")}`
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              {(messageText || imageFile) && (
                <Buton
                  onClick={sendMessage}
                  className="
                  px-6
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  shadow-lg
                  shadow-cyan-500/30
                  hover:scale-105
                  transition-all
                "
                >
                  {" "}
                  {broadcastAll ? `${t("enviarTodos")}` : `${t("enviar")}`}
                </Buton>
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
