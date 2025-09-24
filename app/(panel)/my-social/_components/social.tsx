/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Button, Text, Title } from "complexes-next-components";
import ModalSocial from "./modal/modal";
import SocialInfo from "./social-info";
import ReservationInfo from "./reservation-info";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

const payload = getTokenPayload();

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
  console.log("dataReservation", dataReservation);
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  return (
    <div>
      {data.map((ele) => {
        // Filtrar reservas para esta actividad
        const reservations =
          dataReservation?.filter((res) => res.activity_id === ele.id) || [];

        return (
          <div
            className="w-full h-[500px] flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md"
            key={ele.id}
          >
            <div className="flex flex-col w-full md:w-[60%] shadow-2xl rounded-sm p-2">
              <Title size="md" font="bold" className="">
                {ele.activity}
              </Title>

              <Text className=" mt-4" size="md">
                {ele.description}
              </Text>

              <Text className=" mt-4" size="md">
                Hora de uso desde las {ele.dateHourStart} hasta las{" "}
                {ele.dateHourEnd}
              </Text>

              <div className=" mt-2">{ele.status}</div>

              <div className="w-full mt-2">
                <Button
                  size="md"
                  colVariant="warning"
                  rounded="md"
                  onClick={() => openModal(ele)}
                >
                  Reservar actividad
                </Button>
              </div>

              <div className="bg-white mt-4 rounded-md p-4">
                {reservations
                  .filter((elem) => elem.iduser === storedUserId)
                  .map((elem, index) => (
                    <div key={elem.id ?? `reservation-${index}`}>
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

            <div className="w-full md:w-[40%] flex">
              <img
                className="w-full h-auto object-cover rounded-sm shadow-2xl"
                alt={ele.activity}
                src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
              />
            </div>
          </div>
        );
      })}

      {showSocial && selectedActivity && (
        <ModalSocial
          activityId={selectedActivity.id}
          dateHourStart={selectedActivity.dateHourStart}
          dateHourEnd={selectedActivity.dateHourEnd}
          title="Reservar actividad"
          isOpen
          onClose={closeModal}
          cuantity={selectedActivity.cuantity}
          reservations={
            dataReservation?.filter(
              (res) => res.activity_id === selectedActivity.id
            ) || []
          }
        />
      )}
    </div>
  );
}
