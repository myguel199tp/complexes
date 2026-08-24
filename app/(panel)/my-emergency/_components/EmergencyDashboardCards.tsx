"use client";

import { Table, Text } from "complexes-next-components";
import { useEmergencyDashboard } from "./useEmergency";

export default function EmergencyDashboardCards({
  emergencyId,
  conjuntoId,
}: {
  emergencyId: string;
  conjuntoId: string;
}) {
  const { data, isLoading } = useEmergencyDashboard(emergencyId, conjuntoId);

  if (isLoading || !data) {
    return <Text size="sm" className="text-slate-400">Cargando tablero...</Text>;
  }

  const cards = [
    { label: "Apartamentos", value: data.totalApartments, color: "bg-slate-100 text-slate-700" },
    { label: "Confirmados", value: data.confirmed, color: "bg-emerald-100 text-emerald-700" },
    { label: "Sin responder", value: data.unresponded, color: "bg-slate-100 text-slate-700" },
    { label: "Necesitan ayuda", value: data.needHelp, color: "bg-orange-100 text-orange-700" },
    { label: "Emergencias médicas", value: data.medicalEmergencies, color: "bg-red-100 text-red-700" },
    { label: "Daños reportados", value: data.damageReported, color: "bg-amber-100 text-amber-700" },
  ];

  const towerRows = data.towers.map((t) => [
    t.tower,
    t.total,
    t.confirmed,
    t.needHelp,
  ]);

  const towerCellClasses = towerRows.map(() =>
    Array(4).fill("bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-4 text-center ${card.color}`}
          >
            <Text size="lg" font="bold">{card.value}</Text>
            <Text size="xs" className="font-medium">{card.label}</Text>
          </div>
        ))}
      </div>

      {data.towers.length > 0 && (
        <div className="mt-4">
          <Table
            headers={["Torre", "Total", "Confirmados", "Necesitan ayuda"]}
            rows={towerRows}
            cellClasses={towerCellClasses}
            borderColor="text-gray-300"
          />
        </div>
      )}
    </div>
  );
}
