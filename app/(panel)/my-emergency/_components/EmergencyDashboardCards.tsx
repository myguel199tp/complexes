"use client";

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
    return <p className="text-sm text-slate-400">Cargando tablero...</p>;
  }

  const cards = [
    { label: "Apartamentos", value: data.totalApartments, color: "bg-slate-100 text-slate-700" },
    { label: "Confirmados", value: data.confirmed, color: "bg-emerald-100 text-emerald-700" },
    { label: "Sin responder", value: data.unresponded, color: "bg-slate-100 text-slate-700" },
    { label: "Necesitan ayuda", value: data.needHelp, color: "bg-orange-100 text-orange-700" },
    { label: "Emergencias médicas", value: data.medicalEmergencies, color: "bg-red-100 text-red-700" },
    { label: "Daños reportados", value: data.damageReported, color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-4 text-center ${card.color}`}
          >
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {data.towers.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">Torre</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Confirmados</th>
                <th className="px-3 py-2 text-left">Necesitan ayuda</th>
              </tr>
            </thead>
            <tbody>
              {data.towers.map((t) => (
                <tr key={t.tower} className="border-t border-slate-100">
                  <td className="px-3 py-2">{t.tower}</td>
                  <td className="px-3 py-2">{t.total}</td>
                  <td className="px-3 py-2">{t.confirmed}</td>
                  <td className="px-3 py-2">{t.needHelp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
