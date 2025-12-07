/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Text, Title } from "complexes-next-components";
import ModalSocial from "./modal/modal";
import SocialInfo from "./social-info";
import ReservationInfo from "./reservation-info";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";

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
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language}>
      {data.map((ele) => {
        // Filtrar reservas para esta actividad
        const reservations =
          dataReservation?.filter((res) => res.activity_id === ele.id) || [];

        return (
          <div
            className="w-full min-h-[200px] flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md shadow-md cursor-pointer hover:border-cyan-800"
            key={ele.id}
            onClick={() => openModal(ele)}
          >
            {/* Columna de información */}
            <div className="flex flex-col w-full md:w-[60%] p-2">
              <Title size="sm" font="bold">
                {ele.activity}
              </Title>

              <Text className="mt-4" size="sm">
                {ele.description}
              </Text>

              <Text className="mt-4" size="sm">
                <Text as="span" size="sm" tKey={t("horauso")}>
                  Hora de uso desde{" "}
                </Text>{" "}
                {ele.dateHourStart}
                <Text as="span" size="sm" tKey={t("hasta")}>
                  {" "}
                  hasta las
                </Text>{" "}
                {ele.dateHourEnd}
              </Text>

              <div className="mt-2">{ele.status}</div>

              {/* Reservas del usuario */}
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

            {/* Imagen */}
            <div className="w-full md:w-[40%] flex">
              <img
                className="w-full h-[250px] md:h-[250px] object-contain rounded-sm shadow-2xl"
                alt={ele.activity}
                src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
              />
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {showSocial && selectedActivity && (
        <ModalSocial
          activityId={selectedActivity.id}
          dateHourStart={selectedActivity.dateHourStart}
          dateHourEnd={selectedActivity.dateHourEnd}
          activityname={selectedActivity.activity}
          title={t("reservar")}
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
