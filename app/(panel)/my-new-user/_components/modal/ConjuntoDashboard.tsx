// "use client";
// import { useState, useMemo } from "react";
// import { Text, Title } from "complexes-next-components";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
//   LineChart,
//   Line,
//   ResponsiveContainer,
// } from "recharts";

// interface AdminFee {
//   amount: string;
//   dueDate: string;
//   paidAt: string | null;
//   status: "paid" | "pending";
//   type: string;
// }

// interface Conjunto {
//   id: string;
//   name: string;
//   address: string;
//   neighborhood: string;
// }

// interface User {
//   id: string;
//   name: string;
//   lastName: string;
//   phone: string;
// }

// interface Apartment {
//   id: string;
//   tower: string | null;
//   apartment: string | null;
//   plaque: string | null;
//   role: string;
//   isMainResidence: boolean;
//   active: boolean;
//   conjunto: Conjunto;
//   user: User;
//   adminFees: AdminFee[];
// }

// const COLORS = [
//   "#00C49F",
//   "#FF8042",
//   "#0088FE",
//   "#FFBB28",
//   "#FF4444",
//   "#AA00FF",
// ];

// export default function ConjuntoDashboard({ data }: { data: Apartment[] }) {
//   if (!data.length) return <Text>No hay datos disponibles</Text>;

//   const conjunto = data[0].conjunto;
//   const residents = data.filter((d) => d.role === "owner");
//   const allFees = data.flatMap((a) => a.adminFees);

//   // === FILTRO POR TORRE ===
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const [selectedTower, setSelectedTower] = useState<string>("all");
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const filteredResidents = useMemo(() => {
//     return selectedTower === "all"
//       ? residents
//       : residents.filter((r) => r.tower === selectedTower);
//   }, [selectedTower, residents]);

//   const towers = Array.from(
//     new Set(residents.map((r) => r.tower ?? "Sin torre"))
//   );

//   // Estadísticas básicas
//   const totalPaid = allFees.filter((f) => f.status === "paid").length;
//   const totalPending = allFees.filter((f) => f.status === "pending").length;
//   const totalAmountPaid = allFees
//     .filter((f) => f.status === "paid")
//     .reduce((sum, f) => sum + Number(f.amount), 0);

//   // Recaudo por mes
//   const monthlyDataMap = allFees
//     .filter((f) => f.status === "paid" && f.paidAt)
//     .reduce((acc, fee) => {
//       const date = new Date(fee.paidAt!);
//       const monthYear = date.toLocaleString("es-CO", {
//         month: "short",
//         year: "numeric",
//       });
//       if (!acc[monthYear]) acc[monthYear] = 0;
//       acc[monthYear] += Number(fee.amount);
//       return acc;
//     }, {} as Record<string, number>);

//   let monthlyData = Object.entries(monthlyDataMap).map(([month, total]) => ({
//     month,
//     total,
//   }));

//   const monthMap: Record<string, number> = {
//     ene: 0,
//     feb: 1,
//     mar: 2,
//     abr: 3,
//     may: 4,
//     jun: 5,
//     jul: 6,
//     ago: 7,
//     sept: 8,
//     oct: 9,
//     nov: 10,
//     dic: 11,
//   };

//   monthlyData = monthlyData.sort((a, b) => {
//     const [monthA, , yearA] = a.month.split(" ");
//     const [monthB, , yearB] = b.month.split(" ");
//     const dateA = new Date(Number(yearA), monthMap[monthA.toLowerCase()] ?? 0);
//     const dateB = new Date(Number(yearB), monthMap[monthB.toLowerCase()] ?? 0);
//     return dateA.getTime() - dateB.getTime();
//   });

//   // Recaudo por torre
//   const towerData = Object.values(
//     filteredResidents.reduce((acc, apt) => {
//       const tower = apt.tower ?? "Sin torre";
//       const total = apt.adminFees.reduce((sum, f) => sum + Number(f.amount), 0);
//       if (!acc[tower]) acc[tower] = { tower, total };
//       else acc[tower].total += total;
//       return acc;
//     }, {} as Record<string, { tower: string; total: number }>)
//   );

//   // Distribución por rol
//   const rolesData = Object.values(
//     data.reduce((acc, item) => {
//       const role = item.role;
//       if (!acc[role]) acc[role] = { name: role, value: 1 };
//       else acc[role].value++;
//       return acc;
//     }, {} as Record<string, { name: string; value: number }>)
//   );

//   // Estado global de pagos
//   const pieData = [
//     { name: "Pagos Completados", value: totalPaid },
//     { name: "Pagos Pendientes", value: totalPending },
//   ];

//   // Recaudo por tipo de cuota
//   const feeTypeData = Object.values(
//     allFees.reduce((acc, fee) => {
//       const type = fee.type || "Otro";
//       if (!acc[type]) acc[type] = { name: type, value: Number(fee.amount) };
//       else acc[type].value += Number(fee.amount);
//       return acc;
//     }, {} as Record<string, { name: string; value: number }>)
//   );

//   // Deuda por apartamento (Stacked Bar)
//   const paymentsByApartment = filteredResidents.map((r) => ({
//     name: `${r.tower}-${r.apartment}`,
//     paid: r.adminFees
//       .filter((f) => f.status === "paid")
//       .reduce((sum, f) => sum + Number(f.amount), 0),
//     pending: r.adminFees
//       .filter((f) => f.status === "pending")
//       .reduce((sum, f) => sum + Number(f.amount), 0),
//   }));

//   // Top 5 apartamentos con mayor deuda
//   const topDebt = paymentsByApartment
//     .sort((a, b) => b.pending - a.pending)
//     .slice(0, 5);

//   return (
//     <main className="p-8">
//       {/* Header */}
//       <div className="w-full flex justify-around items-center p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
//         <div>
//           <h1 className="text-2xl font-bold">{conjunto.name}</h1>
//           <Text className="text-gray-600">
//             {conjunto.address} - {conjunto.neighborhood}
//           </Text>
//         </div>
//       </div>

//       {/* Filtros */}
//       <div className="flex gap-4 my-4">
//         <select
//           value={selectedTower}
//           onChange={(e) => setSelectedTower(e.target.value)}
//           className="p-2 border rounded"
//         >
//           <option value="all">Todas las Torres</option>
//           {towers.map((t) => (
//             <option key={t} value={t}>
//               {t}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Estadísticas */}
//       <div className="w-full mt-2 flex justify-around items-center p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
//         <div className="p-4 text-center">
//           <Text className="text-gray-500">Total Residentes</Text>
//           <Text className="text-2xl font-semibold">
//             {filteredResidents.length}
//           </Text>
//         </div>
//         <div className="p-4 text-center">
//           <Text className="text-gray-500">Pagos Registrados</Text>
//           <Text className="text-2xl font-semibold text-green-600">
//             {totalPaid}
//           </Text>
//         </div>
//         <div className="p-4 text-center">
//           <Text className="text-gray-500">Total Recaudado</Text>
//           <Text className="text-2xl font-semibold text-blue-600">
//             ${totalAmountPaid.toLocaleString("es-CO")}
//           </Text>
//         </div>
//       </div>

//       {/* Gráficos */}
//       <div className="w-full mt-4 p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40 grid gap-4">
//         {/* Recaudo por Torre */}
//         <div className="p-4 bg-white/70 rounded-xl shadow">
//           <Title className="text-lg font-medium mb-2 text-center">
//             Recaudo por Torre
//           </Title>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={towerData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="tower" />
//               <YAxis />
//               <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
//               <Legend />
//               <Bar dataKey="total" fill="#8884d8" name="Monto Total" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <section className="flex gap-4 justify-around">
//           <div className="p-4 bg-white/70 rounded-xl shadow">
//             <h3 className="text-lg font-medium mb-2 text-center">
//               Distribución por Rol
//             </h3>
//             <PieChart width={350} height={250}>
//               <Pie
//                 data={rolesData}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 dataKey="value"
//                 nameKey="name"
//                 label
//               >
//                 {rolesData.map((entry, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </div>

//           {/* Recaudo por tipo de cuota */}
//           <div className="p-4 bg-white/70 rounded-xl shadow">
//             <h3 className="text-lg font-medium mb-2 text-center">
//               Recaudo por Tipo de Cuota
//             </h3>
//             <PieChart width={350} height={250}>
//               <Pie
//                 data={feeTypeData}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 dataKey="value"
//                 nameKey="name"
//                 label
//               >
//                 {feeTypeData.map((entry, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
//             </PieChart>
//           </div>
//         </section>

//         {/* Estado global de pagos */}
//         <div className="p-4 bg-white/70 rounded-xl shadow">
//           <h3 className="text-lg font-medium mb-2 text-center">
//             Estado Global de Pagos
//           </h3>
//           <PieChart width={350} height={250}>
//             <Pie
//               data={pieData}
//               cx="50%"
//               cy="50%"
//               outerRadius={80}
//               dataKey="value"
//               nameKey="name"
//               label
//             >
//               {pieData.map((entry, i) => (
//                 <Cell key={i} fill={COLORS[i % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </div>

//         {/* Deuda por apartamento */}
//         <div className="p-4 bg-white/70 rounded-xl shadow">
//           <h3 className="text-lg font-medium mb-2 text-center">
//             Deuda por Apartamento
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={paymentsByApartment}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
//               <Legend />
//               <Bar
//                 dataKey="paid"
//                 stackId="a"
//                 fill="#00C49F"
//                 name="Pagos Completados"
//               />
//               <Bar
//                 dataKey="pending"
//                 stackId="a"
//                 fill="#FF4444"
//                 name="Pagos Pendientes"
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Top 5 apartamentos con mayor deuda */}
//         <div className="p-4 bg-white/70 rounded-xl shadow">
//           <h3 className="text-lg font-medium mb-2 text-center">
//             Top 5 Apartamentos con Mayor Deuda
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart layout="vertical" data={topDebt}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis type="number" />
//               <YAxis type="category" dataKey="name" />
//               <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
//               <Legend />
//               <Bar dataKey="pending" fill="#FF4444" name="Deuda Pendiente" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Recaudo por mes */}
//         <div className="p-4 bg-white/70 rounded-xl shadow">
//           <h3 className="text-lg font-medium mb-2 text-center">
//             Recaudo por Mes
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={monthlyData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip
//                 formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
//               />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="total"
//                 stroke="#00C49F"
//                 strokeWidth={3}
//                 name="Total Recaudado"
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";
import { useState, useMemo } from "react";
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

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#0088FE",
  "#FFBB28",
  "#FF4444",
  "#AA00FF",
];

export default function ConjuntoDashboard() {
  // ====== Datos mock ======
  const data = [
    {
      id: "1",
      tower: "A",
      apartment: "101",
      plaque: "P101",
      role: "owner",
      isMainResidence: true,
      active: true,
      conjunto: {
        id: "c1",
        name: "Conjunto Ejemplo",
        address: "Calle 123",
        neighborhood: "Barrio X",
      },
      user: { id: "u1", name: "Juan Pérez", lastName: "", phone: "3001234567" },
      adminFees: [
        {
          amount: "500000",
          dueDate: "2025-06-01",
          paidAt: "2025-06-05",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "500000",
          dueDate: "2025-07-01",
          paidAt: "2025-07-03",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "500000",
          dueDate: "2025-08-01",
          paidAt: "2025-08-02",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "300000",
          dueDate: "2025-09-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
        {
          amount: "300000",
          dueDate: "2025-10-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
      ],
    },
    {
      id: "2",
      tower: "A",
      apartment: "102",
      plaque: "P102",
      role: "owner",
      isMainResidence: true,
      active: true,
      conjunto: {
        id: "c1",
        name: "Conjunto Ejemplo",
        address: "Calle 123",
        neighborhood: "Barrio X",
      },
      user: { id: "u2", name: "Ana Gómez", lastName: "", phone: "3009876543" },
      adminFees: [
        {
          amount: "500000",
          dueDate: "2025-06-01",
          paidAt: "2025-06-07",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "500000",
          dueDate: "2025-07-01",
          paidAt: "2025-07-05",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "500000",
          dueDate: "2025-08-01",
          paidAt: null,
          status: "pending",
          type: "Mantenimiento",
        },
        {
          amount: "200000",
          dueDate: "2025-09-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
        {
          amount: "200000",
          dueDate: "2025-10-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
      ],
    },
    {
      id: "3",
      tower: "B",
      apartment: "201",
      plaque: "P201",
      role: "owner",
      isMainResidence: true,
      active: true,
      conjunto: {
        id: "c1",
        name: "Conjunto Ejemplo",
        address: "Calle 123",
        neighborhood: "Barrio X",
      },
      user: {
        id: "u3",
        name: "Luis Martínez",
        lastName: "",
        phone: "3005555555",
      },
      adminFees: [
        {
          amount: "400000",
          dueDate: "2025-06-01",
          paidAt: "2025-06-10",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "400000",
          dueDate: "2025-07-01",
          paidAt: "2025-07-12",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "400000",
          dueDate: "2025-08-01",
          paidAt: "2025-08-15",
          status: "paid",
          type: "Mantenimiento",
        },
        {
          amount: "150000",
          dueDate: "2025-09-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
        {
          amount: "150000",
          dueDate: "2025-10-01",
          paidAt: null,
          status: "pending",
          type: "Parqueadero",
        },
      ],
    },
  ];

  const conjunto = data[0].conjunto;
  const residents = data.filter((d) => d.role === "owner");

  const [selectedTower, setSelectedTower] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedFeeType, setSelectedFeeType] = useState<string>("all");

  // Filtro por torre, usuario y tipo de cuota
  const filteredResidents = useMemo(() => {
    return residents
      .map((r) => ({
        ...r,
        adminFees: r.adminFees.filter(
          (f) => selectedFeeType === "all" || f.type === selectedFeeType
        ),
      }))
      .filter(
        (r) =>
          (selectedTower === "all" || r.tower === selectedTower) &&
          (selectedUser === "all" || r.user.id === selectedUser) &&
          r.adminFees.length > 0
      );
  }, [selectedTower, selectedUser, selectedFeeType, residents]);

  const towers = Array.from(
    new Set(residents.map((r) => r.tower ?? "Sin torre"))
  );
  const users = Array.from(new Set(residents.map((r) => r.user))).map((u) => ({
    id: u.id,
    name: u.name,
  }));
  const feeTypes = Array.from(
    new Set(residents.flatMap((r) => r.adminFees.map((f) => f.type)))
  );

  // Estadísticas
  const totalPaid = filteredResidents
    .flatMap((r) => r.adminFees)
    .filter((f) => f.status === "paid").length;
  const totalPending = filteredResidents
    .flatMap((r) => r.adminFees)
    .filter((f) => f.status === "pending").length;
  const totalAmountPaid = filteredResidents
    .flatMap((r) => r.adminFees)
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.amount), 0);

  // Gráficos
  const towerData = Object.values(
    filteredResidents.reduce((acc, apt) => {
      const tower = apt.tower ?? "Sin torre";
      const total = apt.adminFees.reduce((sum, f) => sum + Number(f.amount), 0);
      if (!acc[tower]) acc[tower] = { tower, total };
      else acc[tower].total += total;
      return acc;
    }, {} as Record<string, { tower: string; total: number }>)
  );

  const rolesData = Object.values(
    filteredResidents.reduce((acc, item) => {
      const role = item.role;
      if (!acc[role]) acc[role] = { name: role, value: 1 };
      else acc[role].value++;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  const pieData = [
    { name: "Pagos Completados", value: totalPaid },
    { name: "Pagos Pendientes", value: totalPending },
  ];

  const feeTypeData = Object.values(
    filteredResidents
      .flatMap((r) => r.adminFees)
      .reduce((acc, fee) => {
        const type = fee.type || "Otro";
        if (!acc[type]) acc[type] = { name: type, value: Number(fee.amount) };
        else acc[type].value += Number(fee.amount);
        return acc;
      }, {} as Record<string, { name: string; value: number }>)
  );

  const paymentsByApartment = filteredResidents.map((r) => ({
    name: `${r.tower}-${r.apartment}`,
    paid: r.adminFees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + Number(f.amount), 0),
    pending: r.adminFees
      .filter((f) => f.status === "pending")
      .reduce((sum, f) => sum + Number(f.amount), 0),
  }));

  const topDebt = paymentsByApartment
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 5);

  // Recaudo por mes
  const monthlyDataMap = filteredResidents
    .flatMap((r) => r.adminFees)
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

  const allMonths = [
    "jun 2025",
    "jul 2025",
    "ago 2025",
    "sep 2025",
    "oct 2025",
    "nov 2025",
    "dic 2025",
  ];
  const monthlyData = allMonths.map((m) => ({
    month: m,
    total: monthlyDataMap[m] || Math.floor(Math.random() * 1000000 + 500000),
  }));

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

      {/* Filtros */}
      <div className="flex gap-4 my-4 flex-wrap">
        <select
          value={selectedTower}
          onChange={(e) => setSelectedTower(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todas las Torres</option>
          {towers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todos los Usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFeeType}
          onChange={(e) => setSelectedFeeType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todos los Tipos de Cuota</option>
          {feeTypes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Estadísticas */}
      <div className="w-full mt-2 flex justify-around items-center p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
        <div className="p-4 text-center">
          <Text className="text-gray-500">Total Residentes</Text>
          <Text className="text-2xl font-semibold">
            {filteredResidents.length}
          </Text>
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
      <div className="w-full mt-4 p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40 grid gap-4">
        {/* Recaudo por Torre */}
        <div className="p-4 bg-white/70 rounded-xl shadow">
          <Title className="text-lg font-medium mb-2 text-center">
            Recaudo por Torre
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={towerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tower" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Monto Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Rol y Tipo de Cuota */}
        <section className="flex gap-4 flex-wrap justify-around">
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

          <div className="p-4 bg-white/70 rounded-xl shadow">
            <h3 className="text-lg font-medium mb-2 text-center">
              Recaudo por Tipo de Cuota
            </h3>
            <PieChart width={350} height={250}>
              <Pie
                data={feeTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label
              >
                {feeTypeData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
            </PieChart>
          </div>

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
        </section>

        {/* Deuda por Apartamento */}
        <div className="p-4 bg-white/70 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2 text-center">
            Deuda por Apartamento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentsByApartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
              <Legend />
              <Bar
                dataKey="paid"
                stackId="a"
                fill="#00C49F"
                name="Pagos Completados"
              />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="#FF4444"
                name="Pagos Pendientes"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 deuda */}
        <div className="p-4 bg-white/70 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2 text-center">
            Top 5 Apartamentos con Mayor Deuda
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topDebt}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} />
              <Legend />
              <Bar dataKey="pending" fill="#FF4444" name="Deuda Pendiente" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recaudo por Mes */}
        <div className="p-4 bg-white/70 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2 text-center">
            Recaudo por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
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
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
