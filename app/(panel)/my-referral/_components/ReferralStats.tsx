// ReferralStats.tsx
export default function ReferralStats({
  total,
  completed,
}: {
  total: number;
  completed: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded-xl">
        <p className="text-gray-500 text-sm">Total referidos</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      <div className="p-4 border rounded-xl">
        <p className="text-gray-500 text-sm">Completados</p>
        <p className="text-2xl font-bold">{completed}</p>
      </div>
    </div>
  );
}
