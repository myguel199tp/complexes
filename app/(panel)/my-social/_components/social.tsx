/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button, Text, Title } from "complexes-next-components";
import ModalSocial from "./modal/modal";
import SocialInfo from "./social-info";
import ReservationInfo from "./reservation-info";

export default function Social() {
  const {
    openModal,
    showSocial,
    selectedActivity,
    closeModal,
    BASE_URL,
    data,
  } = SocialInfo();

  const { data: dataReservation } = ReservationInfo();
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  return (
    <>
      {data.map((ele) => {
        // Filtrar reservas para esta actividad
        const reservations =
          dataReservation?.filter((res) => res.activityId === ele._id) || [];

        return (
          <div
            className="w-full h-80 flex flex-row gap-5 p-5 m-2 bg-cyan-800 rounded-md"
            key={ele._id}
          >
            <div className="flex flex-col w-[60%] shadow-2xl rounded-sm p-2">
              <Title size="md" font="bold" className="text-white">
                {ele.activity}
              </Title>

              <Text className="text-white mt-4" size="md">
                {ele.description}
              </Text>

              <Text className="text-white mt-4" size="md">
                Hora de uso desde las {ele.dateHourStart} hasta las{" "}
                {ele.dateHourEnd}
              </Text>

              <div className="text-white mt-2">{ele.status}</div>

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

              <div className="bg-white mt-4 rounded-md p-4">
                {reservations
                  .filter((elem) => elem.iduser === storedUserId)
                  .map((elem) => (
                    <div key={elem._id}>
                      <Text size="sm" font="bold">
                        Usted reservó para el{" "}
                        {new Date(elem.reservationDate).toLocaleString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </Text>
                    </div>
                  ))}
              </div>
            </div>

            <div className="w-[40%]">
              <img
                className="w-full h-full rouded-sm  shadow-2xl"
                alt={ele.activity}
                src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
              />
            </div>
          </div>
        );
      })}

      {showSocial && selectedActivity && (
        <ModalSocial
          activityId={selectedActivity._id}
          dateHourStart={selectedActivity.dateHourStart}
          dateHourEnd={selectedActivity.dateHourEnd}
          title="Reservar actividad"
          isOpen={true}
          onClose={closeModal}
          cuantity={selectedActivity.cuantity}
          reservations={
            dataReservation?.filter(
              (res) => res.activityId === selectedActivity._id
            ) || []
          }
        />
      )}
    </>
  );
}
