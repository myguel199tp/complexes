"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";

type Reservation = {
  id: string;
  place: string;
  location: string;
  date: string;
  image: string;
};

const reservations: Reservation[] = [
  {
    id: "1",
    place: "Cabaña del Lago",
    location: "Guatapé, Antioquia",
    date: "12 Mar 2026",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    id: "2",
    place: "Hotel Playa Azul",
    location: "Cartagena",
    date: "05 Ene 2026",
    image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210a0",
  },
];

export default function Myreservs(): React.JSX.Element {
  const router = useRouter();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const handleNewReservation = (): void => {
    router.push(route.holiday);
  };

  const toggleDetails = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSaveReview = (): void => {
    console.log({
      rating,
      comment,
      reservationId: expandedId,
    });

    setRating(0);
    setComment("");
    setExpandedId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Mis Reservas
          </h1>
          <p className="text-gray-500 text-sm">
            Aquí puedes ver los lugares donde has reservado o viajado.
          </p>
        </div>

        <Button onClick={handleNewReservation} colVariant="warning">
          Quiero reservar
        </Button>
      </div>

      {/* Content */}
      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 mb-4">Aún no tienes reservas.</p>

          <button
            onClick={handleNewReservation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Buscar lugares
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => {
            const isExpanded = expandedId === reservation.id;

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
              >
                <img
                  src={reservation.image}
                  alt={reservation.place}
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {reservation.place}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {reservation.location}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Reserva: {reservation.date}
                  </p>

                  <button
                    onClick={() => toggleDetails(reservation.id)}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg"
                  >
                    {isExpanded ? "Cerrar detalles" : "Ver detalles"}
                  </button>

                  {/* EXPANSIÓN */}
                  {isExpanded && (
                    <div className="mt-4 border-t pt-4 space-y-3">
                      {/* Rating */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Califica tu estadía
                        </p>

                        <div className="flex gap-2 text-xl cursor-pointer">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setRating(star)}
                              className={
                                star <= rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Escribe tu comentario sobre el lugar..."
                          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        onClick={handleSaveReview}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                      >
                        Guardar reseña
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
