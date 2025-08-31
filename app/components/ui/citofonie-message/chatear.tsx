/* eslint-disable @next/next/no-img-element */
// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import {
//   Buton,
//   Button,
//   SelectField,
//   Text,
//   Tooltip,
// } from "complexes-next-components";
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { Socket } from "socket.io-client";
// import { initializeSocket } from "./socket";
// import { allUserListService } from "./services/userlistSerive";
// import { UsersResponse } from "@/app/(panel)/my-new-user/services/response/usersResponse";
// import { useAuth } from "@/app/middlewares/useAuth";
// import { parseCookies } from "nookies";
// import { AiOutlineWechat } from "react-icons/ai";
// import { getTokenPayload } from "@/app/helpers/getTokenPayload";
// import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
// import { useSidebarInformation } from "../sidebar-information";

// // Mensaje recibido del servidor (no incluye roomId)
// interface ReceivedMessage {
//   userId: string;
//   name: string;
//   message: string;
// }

// interface Message {
//   roomId: string;
//   userId: string;
//   name: string;
//   message: string;
// }

// export default function Chatear() {
//   const payload = getTokenPayload();
//   const { valueState } = useSidebarInformation();
//   const { conjuntoId } = useConjuntoStore();
//   const infoConjunto = conjuntoId ?? "";
//   const [chat, setChat] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);
//   const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>({});
//   const [lastMessage, setLastMessage] = useState<Message | null>(null);
//   const isLoggedIn = useAuth();
//   const { accessToken: token } = parseCookies();

//   const [recipientId, setRecipientId] = useState("");
//   const [messageText, setMessageText] = useState("");
//   const [data, setData] = useState<UsersResponse[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   const storedUserId =
//     (typeof window !== "undefined" ? payload?.id : null) || "";
//   const storedName =
//     (typeof window !== "undefined" ? payload?.name : null) || "";
//   const storedRol =
//     (typeof window !== "undefined" ? payload?.role : null) || "";

//   // Carga lista de usuarios
//   useEffect(() => {
//     allUserListService(infoConjunto)
//       .then(setData)
//       .catch((err) => {
//         console.error("Error al obtener usuarios:", err);
//         setError(err instanceof Error ? err.message : "Error desconocido");
//       });
//   }, []);

//   const socketRef = useRef<Socket | null>(null);

//   // Conexión y listeners
//   useEffect(() => {
//     if (!isLoggedIn || !storedUserId || !storedName || !token) return;
//     if (socketRef.current) return;

//     const socket = initializeSocket(storedUserId, storedName, token);
//     socketRef.current = socket;
//     socket.on("connect", () => setIsConnected(true));
//     socket.on("disconnect", () => setIsConnected(false));

//     // Mensajes entrantes
//     const handleReceive = (msg: ReceivedMessage) => {
//       const roomId = [msg.userId, storedUserId].sort().join("_");
//       const fullMsg: Message = { ...msg, roomId };
//       setMessages((prev) => ({
//         ...prev,
//         [roomId]: [...(prev[roomId] || []), fullMsg],
//       }));
//       setLastMessage(fullMsg);
//       if (msg.userId !== storedUserId) {
//         setChat(true);
//         setUnreadMessages((u) => u + 1);
//       }
//     };
//     socket.on("receiveMessage", handleReceive);

//     // Resultado test WhatsApp
//     socket.on("testResult", (res) => {
//       console.log("✅ testWhatsApp result:", res);
//     });

//     socket.on("testWhatsApp", () => {
//       // lógica para probar WhatsApp
//       socket.emit("testResult", { success: true });
//     });

//     // Resultado llamada
//     socket.on("callInitiated", (sid: string) => {
//       console.log("📞 callInitiated SID:", sid);
//     });

//     return () => {
//       socket.off("receiveMessage", handleReceive);
//       socket.off("testResult");
//       socket.off("callInitiated");
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [isLoggedIn, storedUserId, storedName, token]);

//   // Unirse a sala al cambiar destinatario
//   useEffect(() => {
//     if (!socketRef.current || !storedUserId || !recipientId) return;
//     socketRef.current.emit("joinRoom", { userId: storedUserId, recipientId });
//   }, [recipientId, storedUserId]);

//   // Envía mensaje
//   const sendMessage = useCallback(() => {
//     if (
//       !recipientId.trim() ||
//       !messageText.trim() ||
//       !socketRef.current ||
//       !isConnected
//     )
//       return;

//     const roomId = [storedUserId, recipientId].sort().join("_");
//     const payload = {
//       userId: storedUserId,
//       recipientId,
//       roomId,
//       message: messageText,
//     };
//     socketRef.current.emit("sendMessage", payload);

//     const fullMsg: Message = { ...payload, name: storedName || "Tú" };
//     setMessages((prev) => ({
//       ...prev,
//       [roomId]: [...(prev[roomId] || []), fullMsg],
//     }));
//     setMessageText("");
//   }, [recipientId, messageText, storedUserId, storedName, isConnected]);

//   // Prueba WhatsApp
//   const testWhatsApp = () => {
//     console.log("🔍 Probar WhatsApp clicked");

//     if (!socketRef.current) {
//       console.error("❌ No socket connection");
//       return;
//     }

//     if (!isConnected) {
//       console.error("❌ Socket no conectado aún");
//       return;
//     }

//     console.log("🟢 Emitiendo evento testWhatsApp");
//     socketRef.current.emit("testWhatsApp");
//   };

//   const sendComplet = () => {
//     sendMessage();
//     testWhatsApp();
//   };

//   // Iniciar llamada de voz
//   const callByVoice = () => {
//     // reemplaza con el teléfono que quieras llamar
//     socketRef.current?.emit("makeCall", { to: "+573001234567" });
//   };

//   const ListUser = useMemo(() => {
//     const users =
//       storedRol === "employee"
//         ? data.filter((u) => u.role === "employee")
//         : data;
//     return users.map((u) => ({ value: u.id, label: u.name }));
//   }, [data, storedRol]);

//   if (error) return <div>{error}</div>;

//   const { userRolName } = valueState;
//   const currentRoom =
//     storedUserId && recipientId
//       ? [storedUserId, recipientId].sort().join("_")
//       : null;

//   return (
//     <div className="relative p-1 rounded-md">
//       {userRolName !== "user" && (
//         <div className="relative inline-block w-10">
//           {unreadMessages > 0 && (
//             <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
//               {unreadMessages}
//             </div>
//           )}
//           <Buton
//             size="sm"
//             rounded="lg"
//             onClick={() => {
//               setChat(!chat);
//               setUnreadMessages(0);
//             }}
//           >
//             <Tooltip content="mensajes" position="bottom">
//               <AiOutlineWechat color="gray" size={30} />
//             </Tooltip>
//           </Buton>
//         </div>
//       )}

//       {chat && (
//         <div className="absolute left-4 p-2 rounded shadow-lg w-96 h-96 overflow-auto z-50 bg-white">
//           {/* Encabezado */}
//           <div className="flex justify-between items-center mb-2">
//             <div className="text-gray-700 font-bold text-sm">
//               Mensajes no leídos: {unreadMessages}
//             </div>
//           </div>

//           {/* Estado conexión */}
//           <div
//             className={`text-sm font-bold ${
//               isConnected ? "text-green-600" : "text-red-600"
//             } mb-2`}
//           >
//             {isConnected ? "Conectado" : "No conectado"}
//           </div>

//           {/* Select usuario */}
//           <SelectField
//             className="mt-1 mb-2"
//             id="role"
//             defaultOption="Selecciona un usuario"
//             value={recipientId}
//             options={ListUser}
//             inputSize="md"
//             rounded="lg"
//             onChange={(e) => setRecipientId(e.target.value)}
//           />

//           {/* Chat */}
//           <div className="max-h-56 overflow-auto border rounded p-2 bg-gray-100 mb-2">
//             {currentRoom && messages[currentRoom]?.length > 0 ? (
//               messages[currentRoom].map((msg, idx) => (
//                 <div key={idx} className="p-1 border-b text-sm">
//                   <Text size="sm" font="bold">
//                     {msg.name}
//                   </Text>
//                   <Text size="sm">{msg.message}</Text>
//                 </div>
//               ))
//             ) : (
//               <p className="text-xs text-gray-500 text-center">
//                 No hay mensajes
//               </p>
//             )}
//           </div>

//           {/* Último mensaje */}
//           <div className="mt-2 border-t pt-2 mb-2">
//             <Text size="sm" font="bold">
//               Último mensaje:
//             </Text>
//             <Text size="sm" font="semi" colVariant="success">
//               {lastMessage?.message || ""}
//             </Text>
//           </div>

//           {/* Input y enviar */}
//           <div className="mt-2 flex">
//             <input
//               type="text"
//               placeholder="Escribe un mensaje..."
//               value={messageText}
//               onChange={(e) => setMessageText(e.target.value)}
//               className="flex-1 p-1 border rounded text-sm mr-2"
//             />
//             <Button onClick={sendComplet} rounded="lg">
//               Enviar
//             </Button>
//           </div>
//           <div className="mt-2">
//             {/* <Button size="sm" onClick={testWhatsApp} className="mr-2">
//                 Probar WhatsApp
//               </Button> */}
//             <Button size="sm" onClick={callByVoice}>
//               Llamar por voz
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "../sidebar-information";

interface ReceivedMessage {
  userId: string;
  name: string;
  message: string | null;
  conjuntoId: string; // 🔑 agregado
  imageUrl?: string | null;
}

interface Message {
  roomId: string;
  userId: string;
  name: string;
  conjuntoId: string; // 🔑 agregado
  message: string | null;
  imageUrl?: string | null;
}

export default function Chatear() {
  const payload = getTokenPayload();
  const { valueState } = useSidebarInformation();
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [chat, setChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  console.log(lastMessage);
  const isLoggedIn = useAuth();
  const { accessToken: token } = parseCookies();

  const [recipientId, setRecipientId] = useState("");
  const [messageText, setMessageText] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [data, setData] = useState<UsersResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const storedUserId = payload?.id || "";
  const storedName = payload?.name || "";
  const storedRol = payload?.role || "";

  // 🔑 socket global
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    allUserListService(infoConjunto)
      .then(setData)
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });
  }, [infoConjunto]);

  useEffect(() => {
    if (!isLoggedIn || !storedUserId || !storedName || !token) return;
    if (socketRef.current) return;

    const socket = initializeSocket(storedUserId, storedName, token);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // 🔑 recibir mensajes agrupados por conjunto + room
    const handleReceive = (msg: ReceivedMessage) => {
      const roomId = `${msg.conjuntoId}_${[msg.userId, storedUserId]
        .sort()
        .join("_")}`;
      const fullMsg: Message = { ...msg, roomId };

      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), fullMsg],
      }));

      setLastMessage(fullMsg);

      if (msg.userId !== storedUserId) {
        setChat(true);
        setUnreadMessages((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, storedUserId, storedName, token]);

  useEffect(() => {
    if (!socketRef.current || !storedUserId || !recipientId || !infoConjunto)
      return;
    socketRef.current.emit("joinRoom", {
      userId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto, // 🔑 importante
    });
  }, [recipientId, storedUserId, infoConjunto]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Error al subir imagen");
    const data = await res.json();
    return data.url;
  };

  const sendMessage = useCallback(async () => {
    if (
      !recipientId.trim() ||
      (!messageText.trim() && !imageFile) ||
      !socketRef.current ||
      !isConnected
    )
      return;

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("Error subiendo imagen:", err);
        return;
      }
    }

    const roomId = `${infoConjunto}_${[storedUserId, recipientId]
      .sort()
      .join("_")}`;

    const payload = {
      userId: storedUserId,
      recipientId,
      conjuntoId: infoConjunto, // 🔑
      roomId,
      message: messageText || null,
      imageUrl: imageUrl || null,
    };

    socketRef.current.emit("sendMessage", payload);

    const fullMsg: Message = { ...payload, name: storedName || "Tú" };
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), fullMsg],
    }));

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
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const ListUser = useMemo(() => {
    const users =
      storedRol === "employee"
        ? data.filter((u) => u.role === "employee")
        : data;
    return users.map((u) => ({ value: u.id, label: u.name }));
  }, [data, storedRol]);

  if (error) return <div>{error}</div>;

  const { userRolName } = valueState;
  const currentRoom =
    storedUserId && recipientId && infoConjunto
      ? `${infoConjunto}_${[storedUserId, recipientId].sort().join("_")}`
      : null;

  return (
    <div className="relative p-1 rounded-md">
      {userRolName !== "user" && (
        <div className="relative inline-block w-10">
          {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
            <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
            </div>
          )}
          <Buton
            size="sm"
            rounded="lg"
            onClick={() => {
              setChat(!chat);
              if (currentRoom) {
                setUnreadMessages((prev) => ({ ...prev, [currentRoom]: 0 }));
              }
            }}
          >
            <Tooltip content="mensajes" position="bottom">
              <AiOutlineWechat color="orange" size={30} />
            </Tooltip>
          </Buton>
        </div>
      )}

      {chat && (
        <div className="absolute left-4 p-2 rounded shadow-lg w-96 h-96 overflow-auto z-50 bg-white">
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

          <div className="max-h-56 overflow-auto border rounded p-2 bg-gray-100 mb-2">
            {currentRoom && messages[currentRoom]?.length > 0 ? (
              messages[currentRoom].map((msg, idx) => (
                <div key={idx} className="p-1 border-b text-sm">
                  <Text size="sm" font="bold">
                    {msg.name}
                  </Text>
                  {msg.message && <Text size="sm">{msg.message}</Text>}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="imagen"
                      className="w-40 h-40 object-cover rounded mt-1"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center">
                No hay mensajes
              </p>
            )}
          </div>

          {/* input de texto + imagen */}
          <div className="mt-2 gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 p-1 border rounded text-sm w-full h-10"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <Button onClick={sendMessage} rounded="lg">
              Enviar
            </Button>
          </div>

          {imagePreview && (
            <div className="mt-2">
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
          )}
        </div>
      )}
    </div>
  );
}
