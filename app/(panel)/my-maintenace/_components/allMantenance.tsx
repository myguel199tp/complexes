"use client";

import { route } from "@/app/_domain/constants/routes";
import { HeaderAction } from "@/app/components/header";
import { Buton, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { FaTools, FaBuilding, FaUserTie, FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";

export default function AllMantenince() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.user);
  };
  return (
    <div className="space-y-2">
      {/* 🧭 HEADER */}

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
            <FaCogs color="white" size={34} />
          )
        }
      />

      {/* 📄 INTRODUCCIÓN */}
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

      {/* 🪜 PASOS */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Text font="bold" className="mb-4">
          ¿Cómo empezar?
        </Text>

        <ol className="list-decimal ">
          <li>
            <Text>
              Registra las áreas o equipos que requieren mantenimiento.
            </Text>
          </li>
          <li>
            <Text>Agrega los proveedores encargados del servicio.</Text>
          </li>
          <li>
            <Text>Asigna y programa el mantenimiento.</Text>
          </li>
        </ol>
      </div>

      {/* 🔘 ACCIONES */}
      <div className="bg-white rounded-lg shadow-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Buton
            colVariant="warning"
            borderWidth="none"
            onClick={() => router.push(route.areaMaintenace)}
            className="flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
          >
            <FaBuilding size={24} />
            <span>Agregar área</span>
          </Buton>

          <Buton
            colVariant="warning"
            borderWidth="none"
            onClick={() => router.push(route.areaProveedor)}
            className="flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
          >
            <FaUserTie size={24} />
            <span>Agregar proveedor</span>
          </Buton>

          <Buton
            colVariant="warning"
            borderWidth="none"
            className="flex flex-col items-center gap-2 py-6 hover:scale-[1.02] transition"
            onClick={() => router.push(route.areAllMaintenance)}
          >
            <FaTools size={24} />
            <span>Asignar mantenimiento</span>
          </Buton>
        </div>
      </div>

      {/* 💡 NOTA */}
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
