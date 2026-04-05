"use client";

import React from "react";
import { Title, Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { FiFileText, FiExternalLink } from "react-icons/fi";

interface Pqr {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "CLOSED" | "PROCESS";
  createdAt: string;
}

interface Props {
  data: Pqr[];
}

export default function AllInfoPqr({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="text-gray-600 text-center py-10">
        <MessageNotData />
      </div>
    );
  }

  return (
    <div
      className="
        px-4 sm:px-6 lg:px-10 mt-6
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        gap-6
      "
    >
      {data.map((item) => {
        return (
          <div
            key={item.id}
            className="
              bg-white
              rounded-xl
              border
              shadow-sm
              hover:shadow-xl
              transition-all
              duration-300
              flex flex-col
              overflow-hidden
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
              <FiFileText className="text-blue-600 text-xl" />

              <div className="flex flex-col">
                <Title as="h3" className="text-base font-semibold">
                  {item.subject}
                </Title>

                <Text size="sm" className="text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>

            {/* STATUS */}
            <div className="px-4 pt-3">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.status === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : item.status === "PROCESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* CONTENT */}
            <div className="p-4 flex-1">
              <div className="rounded-lg border p-3 bg-gray-50 h-[250px] overflow-auto">
                <Text size="sm" className="text-gray-700">
                  {item.description}
                </Text>
              </div>
            </div>

            {/* ACTION */}
            <div className="px-4 pb-4">
              <button
                className="
                  flex items-center justify-center gap-2
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  text-sm
                  font-medium
                  py-2.5
                  rounded-lg
                  transition
                "
              >
                <FiExternalLink />
                Ver detalle
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
