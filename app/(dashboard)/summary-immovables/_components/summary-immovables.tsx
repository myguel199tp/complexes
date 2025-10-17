"use client";
import React, { useEffect, useState } from "react";
import { Button, InputField, Title, Text } from "complexes-next-components";
import { useSearchParams } from "next/navigation";
import { immovableSummaryService } from "../services/summary-inmovables-service";
import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";
import ShareButtons from "./shareButtons";
import Summary from "./card-summary/summary";
import ModalSummary from "./modal/modal";
import { ImSpinner9 } from "react-icons/im";
import Map from "./map";

export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [data, setData] = useState<InmovableResponses>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const openModal = () => setShowSummary(true);
  const closeModal = () => setShowSummary(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await immovableSummaryService({ id: id ?? undefined });
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!data) return;

    const params = new URLSearchParams({
      street: data.address || "",
      suburb: data.neighborhood || "",
      city: data.city || "",
      country: "colombia",
      format: "json",
      limit: "1",
      countrycodes: "co",
      bounded: "1",
    });

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result: { lat: string; lon: string }[] = await res.json();
        if (result.length > 0) {
          setCoords({
            lat: parseFloat(result[0].lat),
            lng: parseFloat(result[0].lon),
          });
        }
      } catch (err) {
        console.error("Error geocoding:", err);
      }
    };

    fetchCoords();
  }, [data]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-blue-600">
        <ImSpinner9 className="animate-spin text-2xl mb-2" />
        <Text>Cargando información...</Text>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Encabezado */}
      <div className="bg-cyan-800 text-center py-1 px-3">
        <Title size="lg" font="bold" className="text-white">
          Apartamento en {data?.ofert === "1" ? "Venta" : "Arriendo"}
        </Title>
        <Text size="md" className="text-gray-100">
          {data?.neighborhood}, {data?.city}
        </Text>
      </div>

      {/* Contenido principal */}
      <div className="grid md:grid-cols-2 gap-8 p-6 items-start">
        {/* Imagen grande */}
        {data?.files && (
          <div className="w-full flex justify-center bg-gray-200">
            <Summary images={data.files} />
          </div>
        )}

        {/* Información */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <Text
              size="md"
              className="text-gray-700 text-justify leading-relaxed"
            >
              {data?.description || "Sin descripción disponible."}
            </Text>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <InputField disabled value={`${data?.room ?? 0} Habitaciones`} />
            <InputField disabled value={`${data?.restroom ?? 0} Baños`} />
            <InputField disabled value={`${data?.parking ?? 0} Parqueaderos`} />
            <InputField disabled value={`Estrato ${data?.stratum ?? "-"}`} />
            <InputField disabled value={`${data?.area ?? 0} m²`} />
            <InputField disabled value={formatCurrency(Number(data?.price))} />
            <InputField
              disabled
              value={formatCurrency(Number(data?.administration))}
            />
            <InputField disabled value={data?.phone || "Sin número"} />
          </div>

          {/* Mapa */}
          {!showSummary && (
            <>
              {coords && (
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <Map lat={coords.lat} lng={coords.lng} label="" />
                </div>
              )}
            </>
          )}

          {/* Botones */}
          <div className="flex justify-center gap-4 pt-2">
            <ShareButtons neigborhood={data?.neighborhood} city={data?.city} />
            <Button colVariant="warning" size="md" onClick={openModal}>
              Contactar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showSummary && <ModalSummary isOpen onClose={closeModal} />}
    </div>
  );
}
