/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Text, Title } from "complexes-next-components";
import ModalSocial from "./modal/modal";
import SocialInfo from "./social-info";
import ReservationInfo from "./reservation-info";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

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
  const storedUserId = useConjuntoStore((state) => state.userId);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const openCancelModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setSelectedReservation(null);
    setShowCancelModal(false);
  };

  return (
    <div key={language} className="space-y-6 mt-2">
      {!data || data?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageNotData />
        </div>
      ) : (
        data?.map((ele) => {
          const reservations =
            dataReservation?.filter((res) => res.activityid === ele.id) || [];

          return (
            <div
              key={ele.id}
              className="w-full flex flex-col md:flex-row overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => openModal(ele)}
            >
              <div className="w-full md:w-[40%] h-[220px] md:h-auto overflow-hidden bg-gray-100">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  alt={ele.activity}
                  src={`${BASE_URL}/uploads/${ele.file.replace(
                    /^.*[\\/]/,
                    "",
                  )}`}
                />
              </div>

              <div className="flex flex-col w-full md:w-[60%] p-6 justify-between">
                <div>
                  <Title size="sm" font="bold">
                    {ele.activity}
                  </Title>

                  <Text
                    className="mt-3 text-gray-600 leading-relaxed"
                    size="sm"
                  >
                    {ele.description}
                  </Text>

                  <Text className="mt-4 text-gray-500" size="sm">
                    <span className="font-semibold text-gray-700">
                      Hora de uso
                    </span>{" "}
                    {ele.dateHourStart} - {ele.dateHourEnd}
                  </Text>

                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-700">
                      {ele.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {reservations
                    .filter((elem) => elem.userid === storedUserId)
                    .map((elem, index) => (
                      <div
                        key={elem.id ?? `reservation-${index}`}
                        className="inline-flex items-center bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCancelModal(elem);
                        }}
                      >
                        Usted reservó el{" "}
                        {new Date(elem.reservation_date).toLocaleString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })
      )}

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
            dataReservation
              ?.filter((res) => res.activityid === selectedActivity.id)
              .map((res) => ({
                reservation_date: res.reservation_date,
              })) || []
          }
        />
      )}

      {showCancelModal && selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in"
          onClick={closeCancelModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <Title size="sm" font="bold" className="text-gray-800">
                Cancelar reserva
              </Title>
            </div>

            <Text className="mt-4 text-gray-600 leading-relaxed">
              ¿Desea cancelar la reserva del{" "}
              <span className="font-semibold text-gray-800">
                {new Date(selectedReservation.reservation_date).toLocaleString(
                  "es-CO",
                )}
              </span>
              ?
            </Text>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                onClick={() => {
                  console.log("Eliminar reserva", selectedReservation.id);
                  closeCancelModal();
                }}
              >
                Eliminar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
