/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Visit } from "../(panel)/my-citofonia/services/response/visit";
import { useVisitInside } from "./myvisitQuery";
import { Title, Text, Modal, Button } from "complexes-next-components";
import { useMutationUploadPayment } from "./myVisitMutation";
import { useAlertStore } from "./store/useAlertStore";

export default function Allvisit() {
  const { data, isLoading, error } = useVisitInside();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { mutate: uploadPayment, isPending } = useMutationUploadPayment();
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes("image")) {
      showAlert("Solo se permiten imágenes", "info");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmitPayment = () => {
    if (!selectedVisit || !file) {
      showAlert("Debes seleccionar una imagen", "info");
      return;
    }

    uploadPayment(
      {
        visitId: selectedVisit.id,
        file,
      },
      {
        onSuccess: () => {
          setOpenModal(false);
          setFile(null);
          setPreview(null);
        },
      },
    );
  };
  const [openModal, setOpenModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  if (isLoading) return <Text>Cargando visitas...</Text>;
  if (error) return <Text>Error al cargar visitas</Text>;

  const handleOpenModal = (visit: Visit) => {
    setSelectedVisit(visit);
    setOpenModal(true);
  };

  const calculateTotal = (visit: Visit) => {
    if (!visit.parkingRatePerHour || !visit.entryTime) return 0;

    const entry = new Date(visit.entryTime).getTime();
    const exit = visit.exitTime
      ? new Date(visit.exitTime).getTime()
      : new Date().getTime(); // si sigue dentro

    const diffMs = exit - entry;

    const hours = Math.ceil(diffMs / (1000 * 60 * 60));

    return hours * visit.parkingRatePerHour;
  };

  return (
    <>
      <div className="p-4 w-96 h-96 overflow-y-auto bg-white">
        <Title className="text-xl font-bold mb-2">Mis visitantes</Title>

        <div className="space-y-4">
          {data?.map((visit: Visit) => (
            <div
              key={visit.id}
              className="border rounded-xl p-5 shadow-sm bg-white space-y-2"
            >
              {/* 🔹 Información básica */}
              <div>
                <Text size="xs">
                  <strong>Nombre:</strong> {visit.namevisit}
                </Text>
                <Text size="xs">
                  <strong>Cédula:</strong> {visit.numberId}
                </Text>
                <Text size="xs">
                  <strong>Apartamento:</strong> {visit.apartment}
                </Text>
                <Text size="xs">
                  <strong>Tipo visita:</strong> {visit.visitType}
                </Text>
              </div>

              {/* 🔹 Estado */}
              <div>
                <Text size="xs">
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      visit.status === "INSIDE"
                        ? "text-green-600"
                        : visit.status === "FINISHED"
                          ? "text-gray-500"
                          : "text-red-500"
                    }`}
                  >
                    {visit.status}
                  </span>
                </Text>
              </div>

              {/* 🔹 Parqueadero */}
              {visit.hasParking && (
                <div>
                  <Text size="xs">
                    <strong>Vehículo:</strong>
                  </Text>
                  <Text size="xs">Placa: {visit.plaque || "Sin placa"}</Text>
                  <Text size="xs">
                    Tarifa/hora: ${visit.parkingRatePerHour?.toLocaleString()}
                  </Text>
                  <Text size="xs">
                    <strong>Total:</strong> $
                    {calculateTotal(visit).toLocaleString()}
                  </Text>
                </div>
              )}

              <div>
                <Text size="xs">
                  <strong>Estado pago:</strong> {visit.paymentStatus}
                </Text>

                {visit.paymentStatus === "PENDING" && (
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    disabled={!visit.exitTime} // 🔥 deshabilita si no ha salido
                    onClick={() => handleOpenModal(visit)}
                  >
                    {!visit.exitTime ? "Debe salir para pagar" : "Pagar"}
                  </Button>
                )}

                <Text size="xs">
                  <strong>Pagado por:</strong> {visit.paidBy || "No registrado"}
                </Text>
                <Text size="xs">
                  <strong>Fecha pago:</strong>{" "}
                  {visit.paymentDate
                    ? new Date(visit.paymentDate).toLocaleString()
                    : "Pendiente"}
                </Text>
                <Text size="xs">
                  <strong>Verificación:</strong>{" "}
                  {visit.paymentVerificationStatus}
                </Text>
              </div>

              {/* 🔹 Tiempos */}
              <div className="text-sm text-gray-600">
                <Text size="xs">
                  <strong>Entrada:</strong>{" "}
                  {new Date(visit.entryTime).toLocaleString()}
                </Text>
                <Text size="xs">
                  <strong>Salida:</strong>{" "}
                  {visit.exitTime
                    ? new Date(visit.exitTime).toLocaleString()
                    : "Aún dentro"}
                </Text>
                <Text size="xs">
                  <strong>Creado:</strong>{" "}
                  {new Date(visit.createdAt).toLocaleString()}
                </Text>
              </div>

              {/* 🔹 Imagen */}
              {visit.file && (
                <div>
                  <Text size="xs">
                    <strong>Archivo:</strong>
                  </Text>
                  <img
                    src={`${BASE_URL}/${visit.file}`}
                    alt="foto"
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-5 space-y-4">
          <Title className="text-lg font-bold">Subir comprobante</Title>

          <Text>
            Visitante: <strong>{selectedVisit?.namevisit}</strong>
          </Text>

          <Text>
            Total a pagar:{" "}
            <strong>
              $
              {selectedVisit
                ? calculateTotal(selectedVisit).toLocaleString()
                : 0}
            </strong>
          </Text>

          {/* INPUT */}
          <div className="space-y-2">
            <Text size="sm">Selecciona imagen del pago</Text>

            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              disabled={isPending}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* PREVIEW */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded"
            />
          )}

          {/* BOTONES 🔥 */}
          <div className="flex gap-2">
            <Button
              className="w-full"
              size="sm"
              onClick={() => {
                setOpenModal(false);
                setFile(null);
                setPreview(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button
              className="w-full bg-green-600 text-white"
              size="sm"
              onClick={handleSubmitPayment}
              disabled={!file || isPending}
            >
              {isPending ? "Subiendo..." : "Enviar comprobante"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
