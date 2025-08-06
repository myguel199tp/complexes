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
  // Sigue tipando data como un único inmueble
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
        console.log("raw API result:", result);

        // Si viene un array, tómate el primero
        setData(result);
      } catch (err) {
        console.error(err);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setLoading(false);
    }
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
        }
      } catch (err) {
        console.error("🚨 Error geocoding:", err);
      }
    };

    fetchCoords();
  }, [data]); //
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Text colVariant="primary">Cargando ...</Text>
        <ImSpinner9 className="animate-spin text-base mr-2 text-blue-400" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="text-center bg-cyan-800 w-full rounded-md p-4">
          <Title size="sm" font="bold" className="text-white">
            Apartamento en {data?.ofert === "1" ? "Venta" : "Arriendo"}
          </Title>
          <Title size="xs" font="semi" className="text-white">
            {data?.neighborhood}, {data?.city}
          </Title>
        </div>
      </div>
      <div className="md:flex">
        {data?.files && <Summary images={data?.files} />}
        <div>
          <div className="w-full my-4 flex justify-center">
            <Text size="md">{data?.description}</Text>
          </div>
          <div className="md:!flex justify-center gap-10 mt-3 p-4">
            <div className="space-y-2">
              <InputField
                className="w-full"
                placeholder="Habitaciones"
                value={`${data?.room} Habitaciónes`}
                disabled
              />
              <InputField
                className="w-full"
                placeholder="Baños"
                value={`${data?.restroom} Baños`}
                disabled
              />
              <InputField
                className="w-full"
                placeholder="Parqueaderos"
                value={`${data?.parking} parqueos`}
                disabled
              />
            </div>

            <div className="space-y-2">
              <InputField
                className="w-full"
                placeholder="Estrato"
                value={`Estrato ${data?.stratum}`}
                disabled
              />
              <InputField
                className="w-full"
                placeholder="Área construida"
                value={`${data?.area} m²`}
                disabled
              />
              <InputField
                className="w-full"
                placeholder="Valor"
                value={formatCurrency(Number(data?.price))}
                disabled
              />
            </div>

            <div className="space-y-2">
              <InputField
                className="w-full"
                placeholder="Administración"
                value={formatCurrency(Number(data?.administration))}
                disabled
              />
              <InputField
                className="w-full"
                placeholder="Whatsapp"
                value={data?.phone}
                disabled
              />
            </div>
          </div>
          {coords && <Map lat={coords.lat} lng={coords.lng} label={""} />}

          <div className="flex mt-2 justify-center gap-4 ">
            <ShareButtons neigborhood={data?.neighborhood} city={data?.city} />

            <Button colVariant="warning" size="sm" onClick={openModal}>
              Contactar
            </Button>
          </div>
        </div>
      </div>
      {showSummary && <ModalSummary isOpen onClose={closeModal} />}
    </>
  );
}
