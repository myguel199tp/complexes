"use client";

import { route } from "@/app/_domain/constants/routes";
import { HeaderAction } from "@/app/components/header";
import { Buton, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { FaTools, FaBuilding, FaUserTie, FaCogs } from "react-icons/fa";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { useMaintenanceStatus } from "./use-maintenance-status";

export default function AllMantenince() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { hasAreas, hasProviders, areasCount, providersCount } =
    useMaintenanceStatus();
  const canAssignMaintenance = hasAreas && hasProviders;

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.areAllMaintenance);
  };

  const StepStatus = ({ done }: { done: boolean }) =>
    done ? (
      <FaCheckCircle className="text-green-600 shrink-0" size={16} />
    ) : (
      <FaRegCircle className="text-gray-400 shrink-0" size={16} />
    );

  return (
    <div className="space-y-2">
      <HeaderAction
        title={"Registrar mantenimiento"}
        tooltip={"Mantenimientos registrados"}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        idicative="Mantenimientos registrados"
      />

      <div className="bg-white rounded-lg shadow-sm space-y-3">
        <Text>
          Desde aquí puedes registrar y programar los mantenimientos de las
          áreas comunes del conjunto, como ascensores, plantas eléctricas,
          bombas de agua u otros equipos.
        </Text>

        <Text>
          Para asignar un mantenimiento primero debes definir el área a mantener
          y el proveedor responsable.
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Text font="bold" className="mb-4">
          ¿Cómo empezar?
        </Text>

        <ol className="space-y-2">
          <li className="flex items-center gap-2">
            <StepStatus done={hasAreas} />
            <Text>
              Paso 1: Registra las áreas o equipos que requieren
              mantenimiento.{" "}
              {hasAreas && (
                <span className="text-green-600 font-medium">
                  ({areasCount} registrada{areasCount === 1 ? "" : "s"})
                </span>
              )}
            </Text>
          </li>
          <li className="flex items-center gap-2">
            <StepStatus done={hasProviders} />
            <Text>
              Paso 2: Agrega los proveedores encargados del servicio.{" "}
              {hasProviders && (
                <span className="text-green-600 font-medium">
                  ({providersCount} registrado{providersCount === 1 ? "" : "s"})
                </span>
              )}
            </Text>
          </li>
          <li className="flex items-center gap-2">
            <StepStatus done={canAssignMaintenance} />
            <Text>Paso 3: Asigna y programa el mantenimiento.</Text>
          </li>
        </ol>
      </div>

      <div className="bg-white rounded-lg shadow-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Buton
            colVariant={hasAreas ? "success" : "primary"}
            borderWidth="none"
            onClick={() => router.push(route.areaMaintenace)}
            className="relative flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
          >
            {hasAreas && (
              <FaCheckCircle
                className="absolute top-2 right-2 text-white"
                size={16}
              />
            )}
            <FaBuilding size={24} />
            <span>Agregar área</span>
          </Buton>

          <Buton
            colVariant={hasProviders ? "success" : "primary"}
            borderWidth="none"
            onClick={() => router.push(route.areaProveedor)}
            className="relative flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
          >
            {hasProviders && (
              <FaCheckCircle
                className="absolute top-2 right-2 text-white"
                size={16}
              />
            )}
            <FaUserTie size={24} />
            <span>Agregar proveedor</span>
          </Buton>

          <Buton
            colVariant={canAssignMaintenance ? "success" : "primary"}
            borderWidth="none"
            className="flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
            onClick={() => router.push(route.areAllMaintenance)}
          >
            <FaTools size={24} />
            <span>Asignar mantenimiento</span>
            {!canAssignMaintenance && (
              <span className="text-xs opacity-80">
                Primero crea área y proveedor
              </span>
            )}
          </Buton>
        </div>
      </div>

      <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded">
        <Text size="sm" color="muted">
          💡 Ejemplo: crea el área “Ascensor Torre A”, luego agrega el proveedor
          “Otis Elevadores” y finalmente asigna el mantenimiento con la
          frecuencia correspondiente.
        </Text>
      </div>
    </div>
  );
}
