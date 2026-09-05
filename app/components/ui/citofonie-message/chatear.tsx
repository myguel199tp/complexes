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
import { useTokenPayload } from "@/app/components/session-provider";
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
import { HiUserGroup } from "react-icons/hi2";
import CreateGroupModal from "./create-group-modal";
import ManageMembersModal from "./manage-members-modal";
import {
  ChatGroupPermissions,
  chatGroupCanManageService,
  chatGroupMessagesService,
  chatGroupsService,
} from "./services/groupServices";
import { ChatGroup } from "./services/response/groupResponse";
import { BsCheck2 } from "react-icons/bs";
import { fileUrl } from "@/app/helpers/fileUrl";

/**
 * Estado de entrega de un mensaje, tal como lo devuelve el backend.
 * 'pending' = guardado; 'delivered' = el otro está conectado; 'read' = lo abrió.
 */
type MessageStatus = "pending" | "delivered" | "read";

interface Message {
  id?: string;
  tempId?: string;
  roomId: string;
  senderId: string;
  recipientId?: string;
  /** Presente solo en los mensajes de grupo. */
  groupId?: string | null;
  conjuntoId: string;
  name: string;
  message: string | null;
  imageUrl?: string | null;
  createdAt?: string | Date;
  status?: MessageStatus;
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
  groupId?: string | null;
  conjuntoId?: string;
  message?: string | null;
  imageUrl?: string | null;
  imageUrlPath?: string;
  createdAt?: string;
  status?: MessageStatus;
  name?: string;
  sender?: { id?: string; userId?: string; name?: string };
  recipient?: { id?: string; userId?: string };
  conjunto?: { id?: string };
  senderName?: string;
}

/**
 * Punto de estado sobre el avatar: verde si la persona está conectada, gris si
 * no. El borde oscuro lo separa de la foto para que se vea sobre cualquier
 * fondo.
 */
function PresenceDot({
  online,
  className = "",
}: {
  online: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span
      title={online ? "En línea" : "Desconectado"}
      className={`
        block h-3 w-3 rounded-full border-2 border-[#0f172a]
        ${online ? "bg-green-500" : "bg-gray-500"}
        ${className}
      `}
    />
  );
}

/**
 * Los checks de la burbuja propia, al estilo de WhatsApp: uno gris cuando el
 * mensaje quedó guardado, dos grises cuando el destinatario está conectado y
 * dos azules cuando ya lo leyó.
 */
function MessageTicks({ status }: { status?: MessageStatus }): JSX.Element {
  const read = status === "read";
  const doubled = read || status === "delivered";

  return (
    <span
      className={`ml-1 inline-flex items-center ${
        read ? "text-sky-400" : "text-gray-300"
      }`}
      title={read ? "Leído" : doubled ? "Entregado" : "Enviado"}
      aria-label={read ? "Leído" : doubled ? "Entregado" : "Enviado"}
    >
      <BsCheck2 size={14} />
      {doubled && <BsCheck2 size={14} className="-ml-2" />}
    </span>
  );
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
  // Antes se comprobaba la cookie accessToken; ahora es httpOnly, así que el
  // indicador de "hay sesión" son los claims verificados en el servidor.
  const session = useTokenPayload();

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

  /**
   * Ids de los usuarios conectados ahora mismo (el punto verde).
   *
   * Se guarda como arreglo y no como Set porque React compara por referencia:
   * con un Set mutado en sitio la lista de usuarios no se volvería a pintar.
   */
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const storedUserId = useConjuntoStore((state) => state.userId);
  const storedName = useConjuntoStore((state) => state.nameUser);

  // ── Grupos ────────────────────────────────────────────────────────────────
  // Pestaña activa de la barra lateral: conversaciones 1-a-1 o grupos.
  const [sidebarTab, setSidebarTab] = useState<"people" | "groups">("people");
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [groupPermissions, setGroupPermissions] =
    useState<ChatGroupPermissions>({
      canManage: false,
      isEmployee: false,
      planAllowsGroups: false,
      plan: null,
    });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);

  const canManageGroups = groupPermissions.canManage;

  const currentRoom: string | null =
    storedUserId && recipientId && infoConjunto
      ? [storedUserId, recipientId, infoConjunto].sort().join("_")
      : null;

  const broadcastRoom = `conjunto:${infoConjunto}`;

  /**
   * Las tres vistas del panel de mensajes comparten el mismo diccionario
   * `messages`, indexado por sala. La de grupo se identifica con el prefijo
   * `group:` para que nunca choque con la sala 1-a-1, que son tres uuid unidos
   * con `_`.
   */
  const groupRoom = selectedGroupId ? `group:${selectedGroupId}` : null;

  const activeRoom: string | null = broadcastAll
    ? broadcastRoom
    : sidebarTab === "groups"
      ? groupRoom
      : currentRoom;

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

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

  // Grupos del conjunto en los que participo, y si puedo administrarlos.
  const loadGroups = useCallback(async () => {
    if (!infoConjunto) return;
    try {
      const [list, permissions] = await Promise.all([
        chatGroupsService(infoConjunto),
        chatGroupCanManageService(infoConjunto),
      ]);
      setGroups(list);
      setGroupPermissions(permissions);
    } catch (err) {
      console.error("Error cargando grupos:", err);
    }
  }, [infoConjunto]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);
  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !session) return;
    if (socketRef.current) return;

    // La identidad ya no va en el handshake: la resuelve el ticket firmado.
    const socket = initializeSocket();
    socketRef.current = socket;

    socket.onAny((event: string, ...args: unknown[]) => {
      console.log("🔸 socket event:", event, args);
    });

    socket.on("connect", () => {
      setIsConnected(true);
      // Por si el socket se reconectó: la lista que mandó el servidor en la
      // conexión anterior ya no vale.
      if (infoConjunto) socket.emit("presence:list", { conjuntoId: infoConjunto });
    });
    socket.on("disconnect", (reason: string) => {
      console.warn("🔌 socket disconnected:", reason);
      setIsConnected(false);
      // Sin conexión no se sabe quién está en línea: dejar los puntos verdes
      // encendidos sería mentir hasta que vuelva el socket.
      setOnlineUsers([]);
    });

    // ── Presencia ───────────────────────────────────────────────────────────
    // Foto completa al conectar (o al pedirla), y luego solo los cambios.
    socket.on(
      "presence:list",
      ({ conjuntoId: cid, online }: { conjuntoId: string; online: string[] }) => {
        if (String(cid) !== String(infoConjunto)) return;
        setOnlineUsers(online.map(String));
      },
    );

    socket.on(
      "presence:update",
      ({
        userId,
        conjuntoId: cid,
        online,
      }: {
        userId: string;
        conjuntoId: string;
        online: boolean;
      }) => {
        if (String(cid) !== String(infoConjunto)) return;

        setOnlineUsers((prev) => {
          const id = String(userId);
          if (online) return prev.includes(id) ? prev : [...prev, id];
          return prev.filter((u) => u !== id);
        });
      },
    );

    // ── Acuse de lectura ────────────────────────────────────────────────────
    // Llega tanto al emisor (para pintar el doble check) como al propio lector
    // en sus otras sesiones (para bajar el contador de no leídos).
    socket.on(
      "messagesRead",
      ({
        readerId,
        senderId,
        conjuntoId: cid,
        messageIds,
      }: {
        readerId: string;
        senderId: string;
        conjuntoId: string;
        messageIds: string[];
      }) => {
        if (String(cid) !== String(infoConjunto)) return;

        const room = [String(readerId), String(senderId), String(cid)]
          .sort()
          .join("_");
        const readSet = new Set(messageIds.map(String));

        setMessages((prev) => {
          const list = prev[room];
          if (!list) return prev;

          return {
            ...prev,
            [room]: list.map((m) =>
              m.id && readSet.has(String(m.id))
                ? { ...m, status: "read" as MessageStatus }
                : m,
            ),
          };
        });

        if (String(readerId) === String(storedUserId)) {
          setUnreadMessages((prev) => ({ ...prev, [room]: 0 }));
        }
      },
    );

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
        status: raw.status ?? "pending",
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

    /**
     * Mensajes de grupo. Van por su propio evento y su propia sala (`group:<id>`)
     * porque no tienen `recipientId`: `normalizeIncoming` los descartaría, y la
     * sala 1-a-1 no existe para ellos.
     */
    const handleReceiveGroup = (raw: IncomingRaw) => {
      const gid = raw.groupId;
      if (!gid) return;

      const room = `group:${gid}`;
      const BASE = process.env.NEXT_PUBLIC_API_URL;
      const senderId = String(raw.senderId ?? raw.sender?.id ?? "");

      const full: Message = {
        id: raw.id,
        tempId: raw.tempId,
        roomId: room,
        senderId,
        groupId: gid,
        conjuntoId: String(raw.conjuntoId ?? infoConjunto),
        name: raw.name ?? raw.sender?.name ?? raw.senderName ?? "Desconocido",
        message: raw.message ?? null,
        imageUrl: raw.imageUrl?.startsWith("http")
          ? raw.imageUrl
          : raw.imageUrl
            ? `${BASE}/${raw.imageUrl.replace(/^\//, "")}`
            : null,
        createdAt: raw.createdAt ?? new Date().toISOString(),
      };

      setMessages((prev) => {
        const list = prev[room] ? [...prev[room]] : [];

        if (full.tempId) {
          const idx = list.findIndex((m) => m.tempId === full.tempId);
          if (idx !== -1) {
            list[idx] = full;
            return { ...prev, [room]: list };
          }
        }
        if (full.id && list.some((m) => m.id === full.id)) return prev;

        return { ...prev, [room]: [...list, full] };
      });

      if (senderId !== storedUserId) {
        setUnreadMessages((prev) => ({
          ...prev,
          [room]: (prev[room] || 0) + 1,
        }));
      }
    };

    socket.on("receiveGroupMessage", handleReceiveGroup);

    socket.on("notification", (n: unknown) => {
      console.log("🔔 notification recibido:", n);
    });

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.off("receiveMessage", handleReceive);
          socketRef.current.off("receiveGroupMessage", handleReceiveGroup);
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
  }, [isLoggedIn, storedUserId, storedName, session, infoConjunto, recipientId]);

  const joinRoomAndWait = useCallback(
    (
      roomId: string,
      payloadJoin: {
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
          // El historial llega como entidad, con las relaciones `sender` y
          // `recipient` en vez de los ids sueltos que manda el socket.
          senderId: String(msg.senderId ?? msg.sender?.id ?? ""),
          recipientId: String(msg.recipientId ?? msg.recipient?.id ?? ""),
          conjuntoId: msg.conjuntoId,
          name: msg.name ?? msg.sender?.name ?? "Desconocido",
          message: msg.message ?? null,
          imageUrl: msg.imageUrl ?? null,
          createdAt: msg.createdAt ?? new Date().toISOString(),
          status: msg.status ?? "pending",
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

  /**
   * Con la conversación abierta, lo que llega se da por leído.
   *
   * Depende también de cuántos mensajes tiene la sala: si solo dependiera de
   * `recipientId`, los que entren mientras la ventana está abierta se quedarían
   * sin acuse hasta cambiar de conversación y volver.
   */
  const openRoomCount = currentRoom ? (messages[currentRoom]?.length ?? 0) : 0;

  useEffect(() => {
    if (!isConnected || !recipientId || !infoConjunto || !currentRoom) return;
    if (sidebarTab !== "people" || broadcastAll) return;

    socketRef.current?.emit("markAsRead", {
      senderId: recipientId,
      conjuntoId: infoConjunto,
    });

    setUnreadMessages((prev) =>
      prev[currentRoom] ? { ...prev, [currentRoom]: 0 } : prev,
    );
  }, [
    isConnected,
    recipientId,
    infoConjunto,
    currentRoom,
    openRoomCount,
    sidebarTab,
    broadcastAll,
  ]);

  // Historial del grupo abierto + entrada a su sala del socket.
  useEffect(() => {
    if (!selectedGroupId || !infoConjunto) return;

    const room = `group:${selectedGroupId}`;
    let cancelled = false;

    socketRef.current?.emit("joinGroup", { groupId: selectedGroupId });

    (async () => {
      try {
        const history = await chatGroupMessagesService(
          selectedGroupId,
          infoConjunto,
        );
        if (cancelled) return;

        const BASE = process.env.NEXT_PUBLIC_API_URL;
        const normalized: Message[] = history.map((m) => ({
          id: m.id,
          roomId: room,
          senderId: String(m.sender?.id ?? m.senderId ?? ""),
          groupId: m.groupId,
          conjuntoId: m.conjuntoId,
          name: m.sender?.name ?? "Desconocido",
          message: m.message ?? null,
          imageUrl: m.imageUrl?.startsWith("http")
            ? m.imageUrl
            : m.imageUrl
              ? `${BASE}/${m.imageUrl.replace(/^\//, "")}`
              : null,
          createdAt: m.createdAt,
        }));

        setMessages((prev) => ({ ...prev, [room]: normalized }));
        setUnreadMessages((prev) => ({ ...prev, [room]: 0 }));
      } catch (err) {
        console.error("❌ Error cargando mensajes del grupo:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedGroupId, infoConjunto]);

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
    const toGroup = sidebarTab === "groups" && Boolean(selectedGroupId);

    if (!broadcastAll && !toGroup && !recipientId.trim()) return;
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

    if (toGroup) {
      const room = `group:${selectedGroupId}`;
      const tempId = `gtemp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      socketRef.current.emit(
        "sendGroupMessage",
        {
          groupId: selectedGroupId,
          message: messageText || null,
          imageUrl: imageUrl || null,
          tempId,
        },
        (ack: string) => console.log("📥 ACK grupo:", ack),
      );

      // Optimista: el servidor lo reemplaza por el confirmado usando `tempId`.
      const optimistic: Message = {
        tempId,
        roomId: room,
        senderId: storedUserId,
        groupId: selectedGroupId,
        conjuntoId: infoConjunto,
        name: storedName || "Tú",
        message: messageText || null,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] ?? []), optimistic],
      }));

      setMessageText("");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (broadcastAll) {
      // Sin `senderId`: el backend lo toma del token. Antes se comprobaba el
      // permiso de difusión contra el id del payload, así que bastaba declarar el
      // de un empleado para difundir a todo el conjunto.
      const payload = {
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
      recipientId,
      conjuntoId: infoConjunto,
    });

    // El remitente sale del token en el servidor, no del payload.
    const payload = {
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
      // Un check gris mientras el servidor confirma; al llegar el eco con el
      // `tempId` se reemplaza por el estado real.
      status: "pending",
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
    sidebarTab,
    selectedGroupId,
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
            {/* Modal envuelve los children en un div propio, por eso el layout
                en columna se define aquí y no en su className */}
            <div className="flex h-[calc(92vh-80px)] flex-col">
              <div className="flex shrink-0 justify-between items-center mb-2">
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

            <section className="flex flex-col md:flex-row w-full mt-4 gap-4 flex-1 min-h-0">
              <div
                className="
    w-full
    md:w-[320px]
    shrink-0
    bg-white/5
    backdrop-blur-xl
    border
    border-white/10
    rounded-2xl
    p-3
  "
              >
                {" "}
                {/* Pestañas: conversaciones 1-a-1 o grupos */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setSidebarTab("people")}
                    className={`
                      flex-1
                      px-3
                      py-2
                      rounded-xl
                      text-sm
                      border
                      transition-colors
                      ${
                        sidebarTab === "people"
                          ? "bg-cyan-500/20 border-cyan-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }
                    `}
                  >
                    Personas
                  </button>
                  <button
                    onClick={() => setSidebarTab("groups")}
                    className={`
                      flex-1
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-3
                      py-2
                      rounded-xl
                      text-sm
                      border
                      transition-colors
                      ${
                        sidebarTab === "groups"
                          ? "bg-cyan-500/20 border-cyan-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }
                    `}
                  >
                    <HiUserGroup size={16} />
                    Grupos
                  </button>
                </div>
                {sidebarTab === "groups" ? (
                  <>
                    {/* Crear grupo: solo el personal administrativo del
                        conjunto. El permiso real lo aplica el backend. En plan
                        básico el botón se muestra deshabilitado, para que se
                        vea que la función existe y de qué depende. */}
                    {groupPermissions.isEmployee && (
                      <div className="mb-3">
                        <Button
                          size="sm"
                          rounded="lg"
                          disabled={!groupPermissions.planAllowsGroups}
                          className={`w-full ${
                            groupPermissions.planAllowsGroups
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                              : "bg-white/10 text-white/50 cursor-not-allowed"
                          }`}
                          onClick={() =>
                            groupPermissions.planAllowsGroups &&
                            setShowCreateGroup(true)
                          }
                        >
                          + Nuevo grupo
                        </Button>

                        {!groupPermissions.planAllowsGroups && (
                          <Text colVariant="on" size="xs" className="opacity-70 mt-1 block">
                            Los grupos están disponibles desde el plan Oro.
                          </Text>
                        )}
                      </div>
                    )}

                    <div className="h-[22vh] md:h-[320px] overflow-y-auto custom-scroll">
                      <ul className="space-y-2">
                        {groups.map((g) => {
                          const room = `group:${g.id}`;
                          const unreadCount = unreadMessages[room] || 0;
                          return (
                            <li key={g.id}>
                              <button
                                onClick={() => {
                                  setSelectedGroupId(g.id);
                                  setBroadcastAll(false);
                                  setUnreadMessages((prev) => ({
                                    ...prev,
                                    [room]: 0,
                                  }));
                                }}
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
  selectedGroupId === g.id
    ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20"
    : "bg-white/5 border-white/10 hover:bg-white/10"
}
`}
                              >
                                <div className="flex gap-3 items-center">
                                  <div className="w-10 h-10 rounded-full bg-cyan-600/40 flex items-center justify-center">
                                    <HiUserGroup size={18} />
                                  </div>
                                  <div>
                                    <Text size="sm" font="bold">
                                      {g.name}
                                    </Text>
                                    <Text size="xs" className="opacity-70">
                                      {g.tower
                                        ? `Torre ${g.tower} · `
                                        : ""}
                                      {g.members?.length ?? 0} integrantes
                                    </Text>
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
                        {groups.length === 0 && (
                          <Text size="xs" className="opacity-70 text-center">
                            {canManageGroups
                              ? "Aún no hay grupos. Crea el primero."
                              : "Todavía no perteneces a ningún grupo."}
                          </Text>
                        )}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                <div className="relative mb-4">
                  <IoSearchCircle
                    size={22}
                    className="absolute left-3 top-3 text-cyan-400"
                  />
                  <InputField
                    regexType="safeChars"
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
                <div className="h-[22vh] md:h-[320px] overflow-y-auto custom-scroll">
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
                              <div className="relative shrink-0">
                                <Avatar
                                  src={
                                    u.imgapt
                                      ? fileUrl(u.imgapt)
                                      : `${BASE_URL}/uploads/default.png`
                                  }
                                  alt={u.label || "Avatar"}
                                  size="md"
                                  border="thick"
                                  shape="round"
                                />
                                <PresenceDot
                                  online={onlineUsers.includes(String(u.value))}
                                  className="absolute bottom-0 right-0"
                                />
                              </div>
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
                  </>
                )}
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                {sidebarTab === "groups" && selectedGroup && (
                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-3
                      mb-2
                      px-4
                      py-2
                      rounded-2xl
                      bg-white/5
                      border
                      border-white/10
                    "
                  >
                    <div className="w-9 h-9 rounded-full bg-cyan-600/40 flex items-center justify-center">
                      <HiUserGroup size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text size="sm" font="bold">
                        {selectedGroup.name}
                      </Text>
                      <Text size="xs" className="opacity-70">
                        {(selectedGroup.members ?? [])
                          .map((m) => m.user?.name ?? "")
                          .filter(Boolean)
                          .slice(0, 4)
                          .join(", ")}
                        {(selectedGroup.members?.length ?? 0) > 4 &&
                          ` y ${(selectedGroup.members?.length ?? 0) - 4} más`}
                      </Text>
                    </div>
                    {/*
                      La membresía no se recalcula sola: sin esta entrada no
                      había forma de meter a alguien al grupo después de
                      crearlo.
                    */}
                    {canManageGroups && (
                      <button
                        type="button"
                        title="Administrar integrantes"
                        onClick={() => setShowManageMembers(true)}
                        className="
                          shrink-0
                          px-3
                          py-1.5
                          rounded-xl
                          text-xs
                          bg-white/10
                          border
                          border-white/20
                          hover:bg-white/20
                          transition-colors
                        "
                      >
                        Integrantes
                      </button>
                    )}
                  </div>
                )}
                {imagePreview ? (
                  <div
                    className="w-full flex-1 min-h-0 overflow-auto items-center justify-center p-2 bg-white/10
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
                      flex-1
                      min-h-0
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
                                    {/* El acuse solo tiene sentido en lo que
                                        yo mandé: en lo recibido ya sé que lo
                                        estoy viendo. */}
                                    {isOwn && !msg.groupId && (
                                      <MessageTicks status={msg.status} />
                                    )}
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
                  shrink-0
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
    shrink-0
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
                regexType="safeChars"
                type="text"
                rounded="md"
                placeholder={
                  broadcastAll
                    ? `${t("paratodos")}`
                    : sidebarTab === "groups" && selectedGroup
                      ? `Mensaje a ${selectedGroup.name}`
                      : `${t("escribemensaje")}`
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
                  {broadcastAll
                    ? `${t("enviarTodos")}`
                    : sidebarTab === "groups"
                      ? "Enviar al grupo"
                      : `${t("enviar")}`}
                </Buton>
              )}
              </div>
            </div>
          </Modal>
        </div>
      )}
      {showCreateGroup && (
        <CreateGroupModal
          conjuntoId={infoConjunto}
          users={data}
          onClose={() => setShowCreateGroup(false)}
          onCreated={(group) => {
            // Se recarga la lista completa para traer los miembros que el
            // backend resolvió desde la torre, no solo los marcados a mano.
            loadGroups();
            setSidebarTab("groups");
            setSelectedGroupId(group.id);
          }}
        />
      )}
      {showManageMembers && selectedGroup && (
        <ManageMembersModal
          conjuntoId={infoConjunto}
          group={selectedGroup}
          users={data}
          onClose={() => setShowManageMembers(false)}
          onUpdated={(updated) => {
            // El backend devuelve el grupo con la membresía ya resuelta, así
            // que se reemplaza en sitio y el modal sigue abierto y al día.
            setGroups((prev) =>
              prev.map((g) => (g.id === updated.id ? updated : g)),
            );
          }}
        />
      )}
    </div>
  );
}
