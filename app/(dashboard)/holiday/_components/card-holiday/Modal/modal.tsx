"use client";
import { Button, Modal } from "complexes-next-components";
import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cardsinfo from "./cards-info";
import Map from "./map";
import { FaImage, FaMapMarkedAlt } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pricePerDay: string;
  promotion?: string;
  country: string;
  city: string;
  neigborhood: string;
  address: string;
  description: string;
  rulesHome: string;
  endeDate: string;
  petsAllowed: string;
  maxGuests: string;
  parking: boolean;
  files?: string[];
  amenities: string[];
  name: string;
}

export default function ModalHolliday({
  isOpen,
  onClose,
  title,
  pricePerDay,
  promotion,
  country,
  city,
  neigborhood,
  address,
  description,
  rulesHome,
  endeDate,
  petsAllowed,
  files,
  maxGuests,
  parking,
  amenities,
  name,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [getPay, setGetPay] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const totalDays = useMemo(() => {
    if (startDate && endDate) {
      const diff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    const base = totalDays * Number(pricePerDay);
    const discount = (base * Number(promotion)) / 100;
    return base - discount;
  }, [totalDays, pricePerDay, promotion]);

  const taxRate = 0.19;
  const taxAmount = totalPrice * taxRate;
  const totalWithTax = totalPrice + taxAmount;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  // --- Obtener coordenadas ---
  useEffect(() => {
    const params = new URLSearchParams({
      street: address,
      suburb: neigborhood,
      city,
      country,
      format: "json",
      limit: "1",
      countrycodes: "co",
    });

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        const data: { lat: string; lon: string }[] = await res.json();
        if (data.length > 0)
          setCoords({ lat: +data[0].lat, lng: +data[0].lon });
      } catch (err) {
        console.error("Error geocoding:", err);
      }
    };

    fetchCoords();
  }, [address, neigborhood, city, country]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} ${name}`}
      className="w-[1100px] h-[650px] max-h-[95vh]"
    >
      {!getPay && (
        <div className="flex flex-col md:flex-row h-full gap-4 bg-gray-200 transition-all duration-500 ease-in-out overflow-hidden">
          {/* BLOQUE IZQUIERDO */}
          <div
            className={`relative rounded-xl overflow-hidden shadow-md flex-1 transition-all duration-500 ease-in-out 
              ${showMap ? "order-2" : "order-1"}`}
          >
            <div className="absolute inset-0">
              {showMap ? (
                coords ? (
                  <Map lat={coords.lat} lng={coords.lng} label={title} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Cargando mapa...
                  </div>
                )
              ) : (
                <Cardsinfo files={files} />
              )}
            </div>

            <div className="absolute bottom-3 right-3 z-20">
              <Button
                colVariant="primary"
                size="md"
                rounded="lg"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? (
                  <FaImage className="mr-2" />
                ) : (
                  <FaMapMarkedAlt className="mr-2" />
                )}
              </Button>
            </div>
          </div>

          {/* BLOQUE DERECHO */}
          <div
            className={`flex flex-col bg-white rounded-xl shadow-md p-6 overflow-y-auto transition-all duration-500 ease-in-out w-full md:w-[35%]
              ${showMap ? "order-1" : "order-2"}`}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {title}
            </h2>

            {!totalDays && (
              <>
                <p className="text-gray-600 text-sm mb-4">{description}</p>
                <hr className="my-2" />
                <p className="text-gray-600 text-sm mb-4">{rulesHome}</p>
              </>
            )}

            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold">
                {country} - {city} - {neigborhood}
              </p>
              <p>Dirección: {address}</p>
              <p>Promoción: {promotion}%</p>
              <p>Parqueadero: {parking ? "Sí" : "No"}</p>
              <p>
                {petsAllowed === "true"
                  ? "Aceptan mascotas"
                  : "No aceptan mascotas"}
              </p>
              <p>Capacidad máxima: {maxGuests}</p>
              <p>Amenidades: {amenities.join(", ")}</p>
            </div>

            <hr className="my-4" />

            {/* CALCULAR PRECIO */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Calcular precio
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="bg-gray-100 p-2 rounded-md w-full sm:w-[160px]"
                  placeholderText="Llegada"
                  minDate={new Date()}
                  maxDate={new Date(endeDate)}
                />
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="bg-gray-100 p-2 rounded-md w-full sm:w-[160px]"
                  placeholderText="Salida"
                  minDate={new Date()}
                  maxDate={new Date(endeDate)}
                />
              </div>

              {totalDays > 0 && (
                <div className="mt-4 text-gray-700 text-sm">
                  <p>Días seleccionados: {totalDays}</p>
                  <p>Subtotal: {formatCurrency(totalPrice)}</p>
                  <p>Impuestos: {formatCurrency(taxAmount)}</p>
                  <p className="font-bold text-lg">
                    Total: {formatCurrency(totalWithTax)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTONES ABAJO */}
      <div className="flex justify-end gap-4 mt-4 border-t pt-4">
        <Button colVariant="danger" size="md" rounded="lg" onClick={onClose}>
          Cancelar
        </Button>

        <Button
          colVariant="primary"
          size="md"
          rounded="lg"
          disabled={totalDays === 0}
          onClick={() => setGetPay(!getPay)}
        >
          Generar reserva
        </Button>
      </div>
    </Modal>
  );
}
