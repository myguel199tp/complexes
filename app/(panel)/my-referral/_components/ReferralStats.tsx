import { Text } from "complexes-next-components";
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
        <Text size="sm" className="text-gray-500">Total referidos</Text>
        <Text size="lg" font="bold">{total}</Text>
      </div>

      <div className="p-4 border rounded-xl">
        <Text size="sm" className="text-gray-500">Completados</Text>
        <Text size="lg" font="bold">{completed}</Text>
      </div>
    </div>
  );
}
