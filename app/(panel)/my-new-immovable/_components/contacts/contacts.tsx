"use client";

import React from "react";
import { Text, Button } from "complexes-next-components";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import MessageNotData from "@/app/components/messageNotData";
import useQueryContacts from "./useQueryContacts";
import { useMutationAttended } from "./use-mutation-attended";

export default function Contacts() {
  const { data, isLoading } = useQueryContacts();
  const { mutate, isPending } = useMutationAttended();

  const contacts = data ?? [];

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">
        <Text size="sm">Cargando contactos...</Text>
      </div>
    );
  }

  if (!contacts.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );
  }

  const pending = contacts.filter((item) => !item.attended).length;

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <Text size="md" font="bold">
          Personas interesadas en tus inmuebles
        </Text>
        {pending > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
            {pending} sin gestionar
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((item) => {
          const fullPhone = `${item.countryCode ?? ""}${item.phoneNum}`.replace(
            /[^0-9+]/g,
            "",
          );

          return (
            <div
              key={item.id}
              className={`border rounded-2xl p-4 shadow-sm ${
                item.attended ? "bg-gray-50 opacity-70" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Text size="sm" font="bold">
                    {item.name}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </div>

                {item.attended && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Gestionado
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <Text size="xs">
                  📞 {item.countryCode} {item.phoneNum}
                </Text>
                {item.maill && <Text size="xs">✉️ {item.maill}</Text>}
                {item.descripton && (
                  <Text size="xs" className="text-gray-600 mt-2">
                    “{item.descripton}”
                  </Text>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <a
                  href={`https://wa.me/${fullPhone.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700"
                >
                  <FaWhatsapp size={16} />
                  WhatsApp
                </a>

                {item.maill && (
                  <a
                    href={`mailto:${item.maill}`}
                    className="flex items-center gap-2 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <MdOutlineMailOutline size={16} />
                    Correo
                  </a>
                )}

                <Button
                  size="xs"
                  colVariant={item.attended ? "warning" : "success"}
                  disabled={isPending}
                  onClick={() =>
                    mutate({ id: item.id, attended: !item.attended })
                  }
                >
                  {item.attended
                    ? "Marcar sin gestionar"
                    : "Marcar como gestionado"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
