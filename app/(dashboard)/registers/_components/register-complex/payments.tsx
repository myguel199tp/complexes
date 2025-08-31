"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Flag,
  InputField,
  Text,
  Tooltip,
} from "complexes-next-components";
import paymentsInfo, { pricingByCountry } from "./payments-info";
import { useRegisterStore } from "../store/registerStore";
import ModalRegisterComplex from "./modal/modal";
import { planFeatures } from "./plans-features";
import { GoAlertFill } from "react-icons/go";

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState<keyof typeof pricingByCountry>("CO");

  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "gold" | "platinum" | null
  >(null);

  const {
    apartmentCount,
    setApartmentCount,
    numericValue,
    plans,
    plansPerApartment,
    formatPrice,
  } = paymentsInfo(country);

  const { showRegistTwo, setPrices, setPlan } = useRegisterStore();

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const renderFeatures = (plan: "basic" | "gold" | "platinum") => (
    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
      {planFeatures[plan].map((f, i) => {
        const feature = typeof f === "string" ? { text: f } : f;
        return (
          <li key={i}>
            <Tooltip
              className="w-full"
              content={feature.tooltip || "Sin descripción"}
            >
              <Text
                size="sm"
                className={feature.tachado ? "line-through text-gray-500" : ""}
              >
                {feature.text}
              </Text>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col md:!flex-row gap-5 w-full justify-center items-center">
      <section className="rounded-lg p-4 w-full">
        <Flag
          colVariant="warning"
          background="warning"
          size="md"
          className="mt-2"
          rounded="lg"
        >
          <div className="flex gap-4">
            <GoAlertFill size={30} />
            <Text size="md" font="semi">
              Incluir los perfiles de los trabajadores que usarán la aplicación:
              por defecto, celador y administrador. Si hay más trabajadores,
              deben agregarse como perfiles adicionales, contándolos como
              “apartamentos” extra para su creación.
            </Text>
          </div>
        </Flag>
        <div className="border-2 p-5 rounded-md mt-3 w-full">
          {/* País */}
          <Text className="mt-2" size="md" font="bold">
            Selecciona tu país
          </Text>
          <select
            className="border rounded-md p-2 mt-2 w-full"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value as keyof typeof pricingByCountry)
            }
          >
            <option value="CO">🇨🇴 Colombia</option>
            <option value="AR">🇦🇷 Argentina</option>
            <option value="CL">🇨🇱 Chile</option>
            <option value="PE">🇵🇪 Perú</option>
            <option value="US">🇺🇸 Estados Unidos</option>
          </select>

          {/* Apartamentos */}
          <Text className="mt-2" size="md" font="bold">
            Inserta la cantidad de inmuebles que tiene el conjunto o unidad
          </Text>
          <InputField
            placeholder="Cantidad de inmuebles"
            className="mt-2"
            rounded="md"
            value={apartmentCount}
            onChange={(e) =>
              setApartmentCount(e.target.value.replace(/\D/g, ""))
            }
          />

          {/* Planes */}
          <Text className="mt-2" size="md" font="bold">
            Selecciona un plan
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {/* Basic */}
            <div
              className={`border p-3 rounded-md cursor-pointer shadow ${
                selectedPlan === "basic" ? " bg-blue-100 text-black" : ""
              }`}
              onClick={() => {
                setSelectedPlan("basic");
                setPrices(plans.basic);
                setPlan("basic");
              }}
            >
              <Text font="bold">Plan Básico</Text>
              <Text size="lg" font="bold">
                Total: {formatPrice(plans.basic)} mensual
              </Text>
              <Tooltip content="Este es el precio  que tendira que pagar cada inmueble">
                <Text size="sm" font="semi">
                  Total cada inmueble: {formatPrice(plansPerApartment.basic)}
                </Text>
              </Tooltip>
              {renderFeatures("basic")}
            </div>

            {/* Gold */}
            <div
              className={`border p-3 rounded-md cursor-pointer shadow ${
                selectedPlan === "gold" ? "bg-yellow-100 text-black" : ""
              }`}
              onClick={() => {
                setSelectedPlan("gold");
                setPrices(plans.gold);
                setPlan("gold");
              }}
            >
              <Text font="bold">Plan Gold</Text>
              <Text size="lg" font="bold">
                Total: {formatPrice(plans.gold)} mensual
              </Text>
              <Tooltip content="Este es el precio  que tendira que pagar cada inmueble">
                <Text size="sm" font="semi">
                  Total cada inmueble: {formatPrice(plansPerApartment.gold)}
                </Text>
              </Tooltip>
              {renderFeatures("gold")}
            </div>

            {/* Platinum */}
            <div
              className={`border p-3 rounded-md cursor-pointer shadow ${
                selectedPlan === "platinum" ? "bg-gray-100 text-black" : ""
              }`}
              onClick={() => {
                setSelectedPlan("platinum");
                setPrices(plans.platinum);
                setPlan("platinum");
              }}
            >
              <Text font="bold">Plan Platinum</Text>
              <Text size="lg" font="bold">
                Total: {formatPrice(plans.platinum)} mensual
              </Text>
              <Tooltip content="Este es el precio  que tendira que pagar cada inmueble">
                <Text size="sm" font="semi">
                  Total cada inmueble: {formatPrice(plansPerApartment.platinum)}
                </Text>
              </Tooltip>
              {renderFeatures("platinum")}
            </div>
          </div>

          {/* Botón siguiente */}
          <div className="flex justify-center mt-4">
            <Button
              disabled={numericValue <= 9 || !selectedPlan}
              colVariant="warning"
              size="full"
              onClick={showRegistTwo}
            >
              Siguiente
            </Button>
          </div>

          {numericValue <= 9 && numericValue !== 0 && (
            <Flag
              colVariant="danger"
              background="danger"
              size="sm"
              className="mt-2"
              rounded="lg"
            >
              <Text size="sm">
                La cantidad de inmuebles debe ser superior o igual a 10
              </Text>
            </Flag>
          )}
        </div>
      </section>

      <ModalRegisterComplex
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
