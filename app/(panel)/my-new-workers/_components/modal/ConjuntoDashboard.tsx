"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Vehicle {
  id: string;
  type: string;
  parkingType: string;
  assignmentNumber: string;
  plaque: string;
}

interface AdminFee {
  amount: string;
  dueDate: string;
  type: string;
  description: string;
}

interface UserData {
  id: string;
  role: string;
  isMainResidence: boolean;
  active: boolean;
  adminFees: AdminFee[];
  vehicles: Vehicle[];
}

interface ConjuntoDashboardProps {
  data: UserData[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF4444",
  "#AA00FF",
];

export default function ConjuntoDashboard({ data }: ConjuntoDashboardProps) {
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  // Aplicar filtros
  const filteredData = data.filter((user) => {
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const hasPayments = user.adminFees.length > 0;
    const matchesPayment =
      paymentFilter === "conPagos"
        ? hasPayments
        : paymentFilter === "sinPagos"
        ? !hasPayments
        : true;
    const matchesActive =
      activeFilter === "activos"
        ? user.active
        : activeFilter === "inactivos"
        ? !user.active
        : true;
    return matchesRole && matchesPayment && matchesActive;
  });

  // 1️⃣ Usuarios por rol
  const roleCounts = filteredData.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 2️⃣ Activos vs inactivos
  const activeData = [
    { name: "Activos", value: filteredData.filter((u) => u.active).length },
    { name: "Inactivos", value: filteredData.filter((u) => !u.active).length },
  ];

  // 3️⃣ Usuarios con pagos pendientes
  const paymentData = [
    {
      name: "Con pagos pendientes",
      value: filteredData.filter((u) => u.adminFees.length > 0).length,
    },
    {
      name: "Sin pagos pendientes",
      value: filteredData.filter((u) => u.adminFees.length === 0).length,
    },
  ];

  // 4️⃣ Usuarios con vehículos
  const vehicleData = [
    {
      name: "Con vehículos",
      value: filteredData.filter((u) => u.vehicles.length > 0).length,
    },
    {
      name: "Sin vehículos",
      value: filteredData.filter((u) => u.vehicles.length === 0).length,
    },
  ];

  // 5️⃣ Tipos de pagos
  const allPayments = filteredData.flatMap((u) => u.adminFees);
  const paymentTypesCounts = allPayments.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const paymentTypesData = Object.entries(paymentTypesCounts).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="w-full p-4 flex flex-col gap-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <select
          className="border rounded-md px-3 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="owner">Owner</option>
          <option value="employee">Employee</option>
          <option value="porter">Porter</option>
        </select>

        <select
          className="border rounded-md px-3 py-2"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">Todos los pagos</option>
          <option value="conPagos">Con pagos pendientes</option>
          <option value="sinPagos">Sin pagos pendientes</option>
        </select>

        <select
          className="border rounded-md px-3 py-2"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">Todos los usuarios</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* Gráfico de barras de roles */}
      <div className="w-full h-64">
        <h2 className="text-lg font-bold mb-2">Usuarios por rol</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={roleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Activos vs Inactivos", data: activeData },
          { title: "Pagos pendientes", data: paymentData },
          { title: "Usuarios con vehículos", data: vehicleData },
          { title: "Tipos de pagos", data: paymentTypesData },
        ].map((chart, i) => (
          <div key={i} className="w-full h-64">
            <h2 className="text-lg font-bold mb-2">{chart.title}</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={COLORS[i % COLORS.length]}
                  label
                >
                  {chart.data.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
