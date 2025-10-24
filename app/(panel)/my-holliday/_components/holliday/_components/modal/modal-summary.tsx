/* eslint-disable @next/next/no-img-element */
"use client";

import { Modal, Text, Badge } from "complexes-next-components";
import React from "react";
import { CreateBedRoomDto } from "@/app/(dashboard)/holiday/services/response/holidayResponses";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  iduser: string;
  property: string;
  name: string;
  bedRooms: CreateBedRoomDto[];
  maxGuests: number;
  neigborhood: string;
  city: string;
  country: string;
  address: string;
  tower: string;
  apartment: string;
  cel: string;
  amenities: string[];
  parking: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  eventsAllowed: boolean;
  residentplace: boolean;
  bartroomPrivate: boolean;
  status: boolean;
  roomingin: boolean;
  price: number;
  currency: string;
  cleaningFee: number;
  deposit: number;
  promotion: string;
  ruleshome: string;
  description: string;
  // 👇 Acepta archivos reales o del backend
  files?: (File | { url?: string; name?: string; [key: string]: any })[];
  // 👇 Permite campos adicionales del backend
  [key: string]: any;
  nameUnit: string;
  unitName: string;
  conjunto_id: string;
  startDate: string;
  endDate: string;
  codigo: string;
  indicative: string;
  anfitrion: string;
  image: string;
  videoUrl: string;
  videos: string[];
}

export default function ModalSummary({ isOpen, onClose, ...data }: Props) {
  const {
    name,
    property,
    city,
    country,
    neigborhood,
    address,
    tower,
    apartment,
    cel,
    amenities,
    parking,
    petsAllowed,
    smokingAllowed,
    eventsAllowed,
    residentplace,
    bartroomPrivate,
    status,
    roomingin,
    price,
    currency,
    cleaningFee,
    deposit,
    promotion,
    ruleshome,
    description,
    nameUnit,
    unitName,
    conjunto_id,
    startDate,
    endDate,
    codigo,
    indicative,
    anfitrion,
    videoUrl,
    files,
  } = data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resumen de la propiedad">
      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Información general */}
        <section>
          <Text className="font-semibold text-lg mb-2">
            🏠 Información general
          </Text>
          <div className="grid grid-cols-2 gap-2">
            <Text>
              <strong>Nombre:</strong> {name}
            </Text>
            <Text>
              <strong>Propiedad:</strong> {property}
            </Text>
            <Text>
              <strong>Ciudad:</strong> {city}
            </Text>
            <Text>
              <strong>País:</strong> {country}
            </Text>
            <Text>
              <strong>Barrio:</strong> {neigborhood}
            </Text>
            <Text>
              <strong>Dirección:</strong> {address}
            </Text>
            <Text>
              <strong>Torre:</strong> {tower}
            </Text>
            <Text>
              <strong>Apartamento:</strong> {apartment}
            </Text>
            <Text>
              <strong>Código:</strong> {codigo}
            </Text>
            <Text>
              <strong>Indicativo:</strong> {indicative}
            </Text>
            <Text>
              <strong>Anfitrión:</strong> {anfitrion}
            </Text>
            <Text>
              <strong>Celular:</strong> {cel}
            </Text>
          </div>
        </section>

        {/* Fechas */}
        <section>
          <Text className="font-semibold text-lg mb-2">📅 Fechas</Text>
          <div className="grid grid-cols-2 gap-2">
            <Text>
              <strong>Inicio:</strong> {startDate}
            </Text>
            <Text>
              <strong>Fin:</strong> {endDate}
            </Text>
          </div>
        </section>

        {/* Unidades */}
        <section>
          <Text className="font-semibold text-lg mb-2">🏢 Unidad</Text>
          <div className="grid grid-cols-2 gap-2">
            <Text>
              <strong>Nombre de unidad:</strong> {nameUnit}
            </Text>
            <Text>
              <strong>Unidad:</strong> {unitName}
            </Text>
            <Text>
              <strong>Conjunto ID:</strong> {conjunto_id}
            </Text>
          </div>
        </section>

        {/* Amenidades */}
        <section>
          <Text className="font-semibold text-lg mb-2">✨ Amenidades</Text>
          <div className="flex flex-wrap gap-2">
            {amenities?.length ? (
              amenities.map((a, i) => <Badge key={i}>{a}</Badge>)
            ) : (
              <Text>Sin amenidades</Text>
            )}
          </div>
        </section>

        {/* Permisos */}
        <section>
          <Text className="font-semibold text-lg mb-2">⚙️ Permisos</Text>
          <div className="grid grid-cols-2 gap-2">
            <Text>
              <strong>Parqueadero:</strong> {parking ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Mascotas:</strong> {petsAllowed ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Fumar permitido:</strong> {smokingAllowed ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Eventos:</strong> {eventsAllowed ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Residente:</strong> {residentplace ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Baño privado:</strong> {bartroomPrivate ? "Sí" : "No"}
            </Text>
            <Text>
              <strong>Estado:</strong> {status ? "Activo" : "Inactivo"}
            </Text>
            <Text>
              <strong>Rooming in:</strong> {roomingin ? "Sí" : "No"}
            </Text>
          </div>
        </section>

        {/* Costos */}
        <section>
          <Text className="font-semibold text-lg mb-2">💰 Costos</Text>
          <div className="grid grid-cols-2 gap-2">
            <Text>
              <strong>Precio:</strong> {price} {currency}
            </Text>
            <Text>
              <strong>Limpieza:</strong> {cleaningFee}
            </Text>
            <Text>
              <strong>Depósito:</strong> {deposit}
            </Text>
            <Text>
              <strong>Promoción:</strong> {promotion || "Ninguna"}
            </Text>
          </div>
        </section>

        {/* Reglas y descripción */}
        <section>
          <Text className="font-semibold text-lg mb-2">
            📋 Reglas y descripción
          </Text>
          <Text>
            <strong>Reglas:</strong> {ruleshome || "Sin reglas"}
          </Text>
          <Text>
            <strong>Descripción:</strong> {description || "Sin descripción"}
          </Text>
        </section>

        {/* Archivos o imágenes */}
        {files && files.length > 0 && (
          <section>
            <Text className="font-semibold text-lg mb-2">🖼️ Archivos</Text>
            <div className="grid grid-cols-3 gap-2">
              {files.map((f, i) => {
                const fileUrl = (f as any).url || "";
                return (
                  <img
                    key={i}
                    src={fileUrl}
                    alt={f.name || `Archivo ${i}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Video */}
        {videoUrl && (
          <section>
            <Text className="font-semibold text-lg mb-2">🎥 Video</Text>
            <video controls className="w-full rounded-xl">
              <source src={videoUrl} type="video/mp4" />
            </video>
          </section>
        )}
      </div>
    </Modal>
  );
}
