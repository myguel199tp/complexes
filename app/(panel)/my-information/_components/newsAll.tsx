/* eslint-disable @next/next/no-img-element */
"use client";
import { Title, Text } from "complexes-next-components";
import { useNewsAllInfoQuery } from "./newsAll-info";

export default function NewsAll() {
  const { data, BASE_URL } = useNewsAllInfoQuery();

  return (
    <>
      {data?.map((ele, index) => {
        const key = ele.id || `news-${index}`;
        return (
          <div
            key={key}
            className="w-full flex flex-row gap-5 p-5 m-2 border border-cyan-800 rounded-md"
          >
            <img
              className="rounded-lg w-[500px]"
              alt={ele.title}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />
            <div className="flex flex-col w-full rounded-sm p-2 border-2 ">
              <Title size="sm" font="bold" className="rounded-sm">
                {ele.title}
              </Title>
              <Text className="mt-2">{ele.textmessage}</Text>
            </div>
          </div>
        );
      })}
    </>
  );
}
