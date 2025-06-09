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
  files?: string[];
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
  starteDate,
  endeDate,
  petsAllowed,
  files,
  maxGuests,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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

  const minDate = useMemo(() => new Date(starteDate), [starteDate]);
  const maxDate = useMemo(() => new Date(endeDate), [endeDate]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    // const fullAddress = `${address}, ${neigborhood}, ${city}, ${country}`;
    const fullAddress = `diagonal 16 b bis, fontibon, bogota, colombia`;

    const fetchCoords = async () => {
      try {
        console.log("Iniciando fetch...");
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            fullAddress
          )}`
        );
        console.log("Respuesta del fetch recibida:", res);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Datos recibidos:", data);

        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
          console.log("Coordenadas establecidas:", {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          console.warn("No se encontraron coordenadas para la dirección.");
        }
      } catch (err) {
        console.error("Error obteniendo coordenadas:", err);
      }
    };

    fetchCoords();
  }, [country, city, neigborhood, address]);

  return (
    <div className="w-full">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex p-2 items-center justify-center flex-row gap-1 w-full border border-gray-500 rounded-md shadow-xl">
          <div className="w-[50%] h-[250px]">
            <Text>
              {country} - {city}
            </Text>
            <Text>{neigborhood}</Text>
            <Text>{address}</Text>
            <Text>Promoción: {promotion}%</Text>
            <Text>existe parqueadero</Text>
            <Text>
              {petsAllowed === "true"
                ? "Aceptan mascotas"
                : "no aceptan mascotas"}
            </Text>
            {coords && <Map lat={coords.lat} lng={coords.lng} label={title} />}
          </div>
          <div className="h-[250px] w-[50%]">
            <Cardsinfo files={files} />
          </div>
        </div>

        <div className="mt-4">
          <Text>{description}</Text>
          <Text>{rulesHome}</Text>

          <Text>Precio por dia: {formatCurrency(+pricePerDay)}</Text>
          <Text> cantidad de personas permitidas{maxGuests}</Text>
          <Text className="mt-2 font-bold">Calcule el precio</Text>
          <div className="flex flex-col md:flex-row mt-2 gap-2 w-full">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="bg-gray-200 p-3 rounded-md w-[200px]"
              placeholderText="fecha de llegada"
              minDate={minDate}
              maxDate={maxDate}
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="bg-gray-200 p-3 rounded-md w-[200px]"
              placeholderText="fecha de salida"
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
          {totalDays > 0 && (
            <div className="mt-4">
              <Text size="sm">Días seleccionados: {totalDays}</Text>
              <Text size="md">
                Subtotal (con descuento): {formatCurrency(totalPrice)}
              </Text>
              <Text size="sm">
                {formatCurrency(taxAmount)} Impuestos y cargos
              </Text>
              <Text className="font-semibold" size="md">
                Total a pagar: {formatCurrency(totalWithTax)}
              </Text>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-center gap-4 my-4">
          <Button colVariant="danger" onClick={onClose}>
            Cancelar
          </Button>

          <Button colVariant="primary" disabled={totalDays === 0}>
            Generar reserva
          </Button>
        </div>
      </Modal>
    </div>
  );
}
