/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Button, Text, Title } from "complexes-next-components";
import { allActivityService } from "../../my-activity/services/activityAllServices";
import { ActivityResponse } from "../../my-activity/services/response/activityResponse";
import ModalSocial from "./modal/modal";

export default function Social() {
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSocial, setShowSocial] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allActivityService();
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

  const openModal = (activity: ActivityResponse) => {
    setSelectedActivity(activity);
    setShowSocial(true);
  };
  const closeModal = () => {
    setShowSocial(false);
  };

  return (
    <>
      {data.map((ele) => {
        return (
          <div
            className="w-full flex flex-row gap-5 p-5 m-2 bg-cyan-800 rounded-md"
            key={ele._id}
          >
            <div className="flex flex-col w-full rounded-sm p-2">
              <Title size="md" font="bold" className="text-white">
                {ele.activity}
              </Title>
              <Text className="text-white mt-4" size="md">
                {ele.description}
              </Text>
              <Text className="text-white mt-4" size="md">
                hora de uso desde las {ele.dateHourStart} hasta las{" "}
                {ele.dateHourEnd}
              </Text>
              <div>{ele.status}</div>
              <div className="w-full mt-2">
                <Button
                  size="md"
                  colVariant="default"
                  rounded="md"
                  onClick={() => openModal(ele)}
                >
                  Reservar actividad
                </Button>
              </div>
            </div>
            <img
              className="rounded-lg"
              width={300}
              height={200}
              alt={ele.activity}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />
          </div>
        );
      })}
      {showSocial && selectedActivity && (
        <ModalSocial
          dateHourStart={selectedActivity.dateHourStart}
          dateHourEnd={selectedActivity.dateHourEnd}
          title="Reservar actividad"
          isOpen
          onClose={closeModal}
        />
      )}
    </>
  );
}
