"use client";
import { Button, Modal, Text } from "complexes-next-components";
import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import Cardsinfo from "./cards-info";
import Map from "./map";
import "react-datepicker/dist/react-datepicker.css";
// import Cardsinfo from "./cards-info";

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
  starteDate: string;
  endeDate: string;
  petsAllowed: string;
  maxGuests: string;
  parking: string;
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
  // starteDate,
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
  const [getPay, setGetPay] = useState<boolean>(false);
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
  const taxAmount = useMemo(() => totalPrice * taxRate, [totalPrice]);
  const totalWithTax = useMemo(
    () => totalPrice + taxAmount,
    [totalPrice, taxAmount]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  const today = new Date(); // Fecha actual
  const maxDate = useMemo(() => new Date(endeDate), [endeDate]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    // Creamos los params de manera estructurada
    const params = new URLSearchParams({
      street: address,
      suburb: neigborhood,
      city,
      country,
      format: "json",
      limit: "1",
      countrycodes: "co",
      bounded: "1",
    });

    const fetchCoords = async () => {
      try {
        console.debug("👉 Fetch Nominatim:", params.toString());
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: { lat: string; lon: string }[] = await res.json();
        console.debug("📍 Resultados Nominatim:", data);

        if (data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          console.warn("❌ No se encontraron coordenadas en Nominatim.");
          // aquí podrías llamar a un segundo geocoder (OpenCage, Google, etc.)
        }
      } catch (err) {
        console.error("🚨 Error geocoding:", err);
      }
    };

    fetchCoords();
  }, [address, neigborhood, city, country]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[1300px] h-[450px]"
    >
      {!getPay && (
        <div className="flex h-full">
          <div className=" w-[50%] p-2 items-center justify-center gap-2 flex-row border border-gray-500 rounded-md shadow-xl">
            {coords && <Map lat={coords.lat} lng={coords.lng} label={title} />}

            <div className="h-[250px] w-[50%] bg">
              <Cardsinfo files={files} />
            </div>
          </div>
          <div className="mt-2 items-center justify-center p-6 bg-red-500 w-[50%]">
            <Text size="sm">{description}</Text>
            <hr />
            <Text size="sm">{rulesHome}</Text>
            <div>
              <Text size="sm" font="bold">
                {country} - {city}- {neigborhood}
              </Text>
              <Text size="sm">Dirección {address}</Text>
              <Text size="sm">Promoción: {promotion}%</Text>
              <Text size="sm">parqueadero: {parking}</Text>
              <Text size="sm"> {name}</Text>
              <Text size="sm"> {amenities}</Text>
              <Text size="sm">
                {petsAllowed === "true"
                  ? "Aceptan mascotas"
                  : "no aceptan mascotas"}
              </Text>
            </div>

            <Text size="sm">
              Precio por dia: {formatCurrency(+pricePerDay)}
            </Text>
            <Text size="sm"> cantidad de personas permitidas: {maxGuests}</Text>
            <Text className="mt-2 font-bold" size="sm">
              Calcule el precio
            </Text>
            <div className="flex flex-col md:flex-row mt-2 gap-2 w-full">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="bg-gray-200 p-3 rounded-md w-[200px]"
                placeholderText="fecha de llegada"
                minDate={today}
                maxDate={maxDate}
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="bg-gray-200 p-3 rounded-md w-[200px]"
                placeholderText="fecha de salida"
                minDate={today}
                maxDate={maxDate}
              />
            </div>
            {totalDays > 0 && (
              <div className="mt-4">
                <Text size="sm">Días seleccionados: {totalDays}</Text>
                <Text size="sm" font="semi">
                  Subtotal (con descuento): {formatCurrency(totalPrice)}
                </Text>
                <Text size="sm">
                  {formatCurrency(taxAmount)} Impuestos y cargos
                </Text>
                <Text className="font-semibold" size="sm">
                  Total a pagar: {formatCurrency(totalWithTax)}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {getPay && (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Realiza tu pago
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan Pérez"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monto (COP)
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="50000"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="button"
                // onClick={() => handlePayment("CARD")}
                className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Pagar con tarjeta de crédito
              </button>

              <button
                type="button"
                // onClick={() => handlePayment("PSE")}
                className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Pagar con PSE
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex w-full items-center justify-center gap-4 my-4">
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
