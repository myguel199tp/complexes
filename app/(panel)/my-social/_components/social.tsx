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
    <div
      key={language}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-6"
    >
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
              onClick={() => openModal(ele)}
              className="
              group
              overflow-hidden
              rounded-2xl
              border border-gray-100
              bg-white
              shadow-sm
              hover:shadow-2xl
              hover:border-cyan-200
              transition-all
              duration-300
              cursor-pointer
            "
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="relative w-full md:w-[35%] h-[240px] overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={ele.activity}
                    src={`${BASE_URL}/uploads/${ele.file.replace(
                      /^.*[\\/]/,
                      "",
                    )}`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-4">
                    <span
                      className="
                      rounded-full
                      bg-white/90
                      backdrop-blur
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-gray-800
                    "
                    >
                      {ele.status}
                    </span>
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <Title size="sm" font="bold">
                        {ele.activity}
                      </Title>

                      <Text
                        size="sm"
                        className="mt-3 text-gray-600 leading-relaxed"
                      >
                        {ele.description}
                      </Text>

                      {/* Badges */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                          🕒 {ele.dateHourStart} - {ele.dateHourEnd}
                        </div>

                        {ele.cuantity && (
                          <div className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
                            👥 {ele.cuantity} cupos
                          </div>
                        )}
                      </div>

                      {/* Reservas */}
                      {reservations.filter(
                        (elem) => elem.userid === storedUserId,
                      ).length > 0 && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                          <Text
                            size="sm"
                            className="font-semibold text-gray-700 mb-3"
                          >
                            Mis reservas
                          </Text>

                          <div className="space-y-2">
                            {reservations
                              .filter((elem) => elem.userid === storedUserId)
                              .map((elem, index) => (
                                <div
                                  key={elem.id ?? `reservation-${index}`}
                                  className="
                                  flex
                                  items-center
                                  gap-3
                                  rounded-xl
                                  border
                                  border-red-100
                                  bg-red-50
                                  px-3
                                  py-3
                                  text-red-700
                                  hover:bg-red-100
                                  transition
                                "
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCancelModal(elem);
                                  }}
                                >
                                  <div className="h-2 w-2 rounded-full bg-red-500" />

                                  <span className="text-sm font-medium">
                                    Reservado el{" "}
                                    {new Date(
                                      elem.reservation_date,
                                    ).toLocaleString("es-CO", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex justify-end mt-6">
                      <button
                        className="
                        rounded-xl
                        bg-cyan-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        hover:bg-cyan-700
                        transition
                      "
                      >
                        Ver disponibilidad
                      </button>
                    </div>
                  </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={closeCancelModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Title size="sm" font="bold">
              Cancelar reserva
            </Title>

            <Text className="mt-4 text-gray-600">
              ¿Desea cancelar la reserva del{" "}
              <span className="font-semibold">
                {new Date(selectedReservation.reservation_date).toLocaleString(
                  "es-CO",
                )}
              </span>
              ?
            </Text>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  closeCancelModal();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
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
