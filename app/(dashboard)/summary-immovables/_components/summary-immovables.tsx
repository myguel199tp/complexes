"use client";
import React, { useEffect, useState } from "react";
import { Button, InputField, Title, Text } from "complexes-next-components";
import { useSearchParams } from "next/navigation";
import { immovableSummaryService } from "../services/summary-inmovables-service";
import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";
import { FaShareAlt } from "react-icons/fa";
import ShareButtons from "./shareButtons";
import Summary from "./card-summary/summary";
import ModalSummary from "./modal/modal";

export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const _id = searchParams.get("_id");

  // Sigue tipando data como un único inmueble
  const [data, setData] = useState<InmovableResponses>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showShare, setShowShare] = useState(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const openModal = () => setShowSummary(true);
  const closeModal = () => setShowSummary(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await immovableSummaryService({ _id: _id ?? undefined });
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

    if (_id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [_id]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  if (loading) {
    return (
      <div>
        <Text>Cargando ...</Text>
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
          <div className="flex mt-2 justify-center gap-4 ">
            <Button size="lg" onClick={() => setShowShare(!showShare)}>
              <div className="flex justify-center gap-2 items-center">
                <FaShareAlt />
                <Text size="sm" font="bold">
                  Compartir
                </Text>
              </div>
            </Button>
            {showShare && (
              <ShareButtons
                neigborhood={data?.neighborhood}
                city={data?.city}
              />
            )}
            <Button colVariant="warning" size="lg" onClick={openModal}>
              Contactar
            </Button>
          </div>
        </div>
      </div>
      {showSummary && <ModalSummary isOpen onClose={closeModal} />}
    </>
  );
}
