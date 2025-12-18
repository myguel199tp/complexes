// ReferralTable.tsx
"use client";

interface Referral {
  id: string;
  referred: { name: string; email: string };
  conjunto: { name: string };
  status: "pending" | "completed" | "rewarded";
}

export default function ReferralTable({
  referrals,
}: {
  referrals: Referral[];
}) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Usuario</th>
            <th className="p-3 text-left">Conjunto</th>
            <th className="p-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref) => (
            <tr key={ref.id} className="border-t">
              <td className="p-3">{ref.referred.name}</td>
              <td className="p-3">{ref.conjunto.name}</td>
              <td className="p-3">
                {ref.status === "pending" && "⏳ Pendiente"}
                {ref.status === "completed" && "✅ Completado"}
                {ref.status === "rewarded" && "🎁 Recompensado"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
