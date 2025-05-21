/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button, Text, Title } from "complexes-next-components";
import ModalSocial from "./modal/modal";
import SocialInfo from "./social-info";

export default function Social() {
  const {
    openModal,
    showSocial,
    selectedActivity,
    closeModal,
    BASE_URL,
    data,
  } = SocialInfo();

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
