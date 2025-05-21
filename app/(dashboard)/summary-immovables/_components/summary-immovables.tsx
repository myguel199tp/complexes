"use client";
import React, { useEffect, useState } from "react";
import { Button, InputField, Title, Text } from "complexes-next-components";
import { useSearchParams } from "next/navigation";
import { immovableSummaryService } from "../services/summary-inmovables-service";
import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";
// import Summary from "./card-summary/summary";
import { FaShareAlt } from "react-icons/fa";
import ShareButtons from "./shareButtons";
import Summary from "./card-summary/summary";
import ModalSummary from "./modal/modal";

export default function SummaryImmovables() {
  const searchParams = useSearchParams();
  const _id = searchParams.get("_id");
  const [data, setData] = useState<InmovableResponses>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showShare, setShowShare] = useState(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const openModal = () => {
    setShowSummary(true);
  };
  const closeModal = () => {
    setShowSummary(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await immovableSummaryService({
          _id: _id ?? undefined,
        });
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <>
      {loading && (
        <div>
          <Text>Cargando ...</Text>
        </div>
      )}
      {!loading && (
        <>
          <div className="fl>ex justify-center">
            <div className="text-center bg-cyan-800 w-full rounded-md">
              <Title size="sm" font="bold" className="text-white">
                Apartamento en {data?.ofert === "1" ? "Venta" : "Arriendo"}
              </Title>
              <Title size="xs" font="semi" className="text-white">
                {data?.neighborhood},{data?.city}
              </Title>
            </div>
          </div>
          {data?.files && <Summary images={data.files} />}
          <div className="w-full">
            <InputField
              className="w-full"
              placeholder="Descripción del inmueble"
              value={String(data?.description)}
              disabled
            />
          </div>
          <div className="flex justify-center gap-10 mt-3 p-4">
            <div>
              <InputField
                className="w-full mt-2"
                placeholder="Números de habitaiones"
                value={`${String(data?.room)} Habitaciónes`}
                disabled
              />
              <InputField
                className="w-full mt-2"
                placeholder="Números de Baños"
                value={`${String(data?.restroom)} Baños`}
                disabled
              />
              <InputField
                className="w-full mt-2"
                placeholder="Parqueaderos"
                value={`${String(data?.parking)} parqueos`}
                disabled
              />
            </div>
            <div>
              <InputField
                className="w-full mt-2"
                placeholder="Estrato"
                value={` Estrato ${String(data?.stratum)}`}
                disabled
              />
              <InputField
                className="w-full mt-2"
                placeholder="Area construida"
                value={`${String(data?.area)}m2`}
                disabled
              />
              <InputField
                className="w-full mt-2"
                placeholder="Valor"
                value={formatCurrency(Number(data?.price))}
                disabled
              />
            </div>
            <div>
              <InputField
                className="w-full mt-2"
                placeholder="Administracion"
                value={formatCurrency(Number(data?.administration))}
                disabled
              />
              <InputField
                className="w-full mt-2"
                placeholder="Whatsapp"
                disabled
                value={String(data?.phone)}
              />
            </div>
            <Button onClick={() => setShowShare(!showShare)}>
              <FaShareAlt />
            </Button>
            {showShare && (
              <ShareButtons
                neigborhood={data!.neighborhood}
                city={data!.city}
              />
            )}
            <Button colVariant="warning" onClick={openModal}>
              contactar
            </Button>
          </div>
          {showSummary && <ModalSummary isOpen onClose={closeModal} />}
        </>
      )}
    </>
  );
}
