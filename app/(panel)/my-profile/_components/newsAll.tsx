/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { Title, Text } from "complexes-next-components";
import { allNewsService } from "../../my-news/services/newsAllServices";
import { NewsResponse } from "../../my-news/services/response/newsResponse";

export default function NewsAll() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allNewsService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <>
      {data.map((ele) => {
        return (
          <div
            className="w-full flex flex-row gap-5 p-5 m-2 bg-cyan-800 rounded-md"
            key={ele._id}
          >
            <img
              className="rounded-lg"
              width={200}
              height={200}
              alt={ele.title}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />
            <div className="flex flex-col w-full rounded-sm p-2 border-2 border-white">
              <Title size="sm" font="bold" className="text-white rounded-sm">
                {ele.title}
              </Title>
              <Text className="text-white mt-4">{ele.textmessage}</Text>
              <div className="mt-6 flex justify-end items-end">
                <Text size="xs" className="text-white" font="normal">
                  {ele.created_at}
                </Text>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
