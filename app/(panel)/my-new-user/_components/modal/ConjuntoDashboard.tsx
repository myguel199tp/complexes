"use client";
import { Text, Title } from "complexes-next-components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface AdminFee {
  amount: string;
  dueDate: string;
  paidAt: string | null;
  status: "paid" | "pending";
}

interface Conjunto {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
}

interface User {
  id: string;
  name: string;
  lastName: string;
  phone: string;
}

interface Apartment {
  id: string;
  tower: string | null;
  apartment: string | null;
  plaque: string | null;
  role: string;
  isMainResidence: boolean;
  active: boolean;
  conjunto: Conjunto;
  user: User;
  adminFees: AdminFee[];
}

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28"];

export default function ConjuntoDashboard({ data }: { data: Apartment[] }) {
  if (!data.length) return <Text>No hay datos disponibles</Text>;

  const conjunto = data[0].conjunto;

  const residents = data.filter((d) => d.role === "owner");

  const allFees = data.flatMap((a) => a.adminFees);
  const totalPaid = allFees.filter((f) => f.status === "paid").length;
  const totalPending = allFees.filter((f) => f.status === "pending").length;
  const totalAmountPaid = allFees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.amount), 0);

  // === 📈 NUEVO: Recaudo por mes ===
  const monthlyDataMap = allFees
    .filter((f) => f.status === "paid" && f.paidAt)
    .reduce((acc, fee) => {
      const date = new Date(fee.paidAt!);
      const monthYear = date.toLocaleString("es-CO", {
        month: "short",
        year: "numeric",
      });
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += Number(fee.amount);
      return acc;
    }, {} as Record<string, number>);

  let monthlyData = Object.entries(monthlyDataMap).map(([month, total]) => ({
    month,
    total,
  }));

  // 🧭 ORDENAR los meses correctamente (enero → diciembre)
  const monthMap: Record<string, number> = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sept: 8,
    oct: 9,
    nov: 10,
    dic: 11,
  };

  monthlyData = monthlyData.sort((a, b) => {
    const [monthA, , yearA] = a.month.split(" ");
    const [monthB, , yearB] = b.month.split(" ");
    const dateA = new Date(Number(yearA), monthMap[monthA.toLowerCase()] ?? 0);
    const dateB = new Date(Number(yearB), monthMap[monthB.toLowerCase()] ?? 0);
    return dateA.getTime() - dateB.getTime();
  });

  // === Gráfico: Recaudo por torre ===
  const towerData = Object.values(
    residents.reduce((acc, apt) => {
      const tower = apt.tower ?? "Sin torre";
      const total = apt.adminFees.reduce((sum, f) => sum + Number(f.amount), 0);
      if (!acc[tower]) acc[tower] = { tower, total };
      else acc[tower].total += total;
      return acc;
    }, {} as Record<string, { tower: string; total: number }>)
  );

  // === Gráfico: Distribución por rol ===
  const rolesData = Object.values(
    data.reduce((acc, item) => {
      const role = item.role;
      if (!acc[role]) acc[role] = { name: role, value: 1 };
      else acc[role].value++;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  // === Gráfico: Estado global de pagos ===
  const pieData = [
    { name: "Pagos Completados", value: totalPaid },
    { name: "Pagos Pendientes", value: totalPending },
  ];

  return (
    <main className="p-8">
      {/* Header */}
      <div className="w-full flex justify-around items-center p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
        <div>
          <h1 className="text-2xl font-bold">{conjunto.name}</h1>
          <Text className="text-gray-600">
            {conjunto.address} - {conjunto.neighborhood}
          </Text>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="w-full mt-2 flex justify-around items-center p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
        <div className="p-4 text-center">
          <Text className="text-gray-500">Total Residentes</Text>
          <Text className="text-2xl font-semibold">{residents.length}</Text>
        </div>
        <div className="p-4 text-center">
          <Text className="text-gray-500">Pagos Registrados</Text>
          <Text className="text-2xl font-semibold text-green-600">
            {totalPaid}
          </Text>
        </div>
        <div className="p-4 text-center">
          <Text className="text-gray-500">Total Recaudado</Text>
          <Text className="text-2xl font-semibold text-blue-600">
            ${totalAmountPaid.toLocaleString("es-CO")}
          </Text>
        </div>
      </div>

      {/* Gráficos */}
      <div className="w-full mt-4 p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
        <div>
          {/* Recaudo por Torre */}
          <div className="p-4 bg-white/70 rounded-xl shadow">
            <Title className="text-lg font-medium mb-2 text-center">
              Recaudo por Torre
            </Title>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={towerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tower" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Monto Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estado global de pagos */}
          <div className="p-4 bg-white/70 rounded-xl shadow">
            <h3 className="text-lg font-medium mb-2 text-center">
              Estado Global de Pagos
            </h3>
            <PieChart width={350} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Roles */}
          <div className="p-4 bg-white/70 rounded-xl shadow">
            <h3 className="text-lg font-medium mb-2 text-center">
              Distribución por Rol
            </h3>
            <PieChart width={350} height={250}>
              <Pie
                data={rolesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label
              >
                {rolesData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* 📈 Recaudo por mes */}
          <div className="p-4 bg-white/70 rounded-xl shadow md:col-span-2 xl:col-span-3">
            <h3 className="text-lg font-medium mb-2 text-center">
              Recaudo por Mes
            </h3>
            <LineChart width={1000} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString("es-CO")}`
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#00C49F"
                strokeWidth={3}
                name="Total Recaudado"
              />
            </LineChart>
          </div>
        </div>
      </div>
    </main>
  );
}
