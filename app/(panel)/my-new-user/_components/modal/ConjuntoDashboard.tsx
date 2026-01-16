"use client";

import { useMemo, useState } from "react";
import { Title, Text } from "complexes-next-components";
import {
  ResponsiveContainer,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";

/* -------------------------
   Tipos según tu payload
--------------------------*/
interface AdminFee {
  amount: string; // "150000.00"
  dueDate: string; // "2025-11-30"
  type: string; // "Cuota de administración"
  description?: string;
  // podría haber paidAt / status en el futuro
  paidAt?: string | null;
  status?: string | null;
}

interface Vehicle {
  id: string;
  type: string;
  parkingType: string;
  assignmentNumber: string;
  plaque: string;
}

interface User {
  id: string;
  name: string;
  lastName?: string | null;
  numberId?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  file?: string | null;
}

export interface Resident {
  id: string;
  tower?: string | null;
  apartment?: string | null;
  plaque?: string | null;
  role: string;
  namesuer?: string | null;
  isMainResidence?: boolean;
  active?: boolean;
  conjunto?: { id: string; name: string; [k: string]: any };
  user: User;
  adminFees: AdminFee[]; // puede venir vacío
  certification?: any[];
  vehicles?: Vehicle[];
}

/* -------------------------
   Helpers
--------------------------*/
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#AA00FF",
  "#A28BFE",
];

function safeParseAmount(a?: string) {
  if (!a) return 0;
  const n = parseFloat(a.replace(",", "").trim());
  return Number.isFinite(n) ? n : 0;
}

function monthKeyFromDateString(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`; // e.g. "2025-11"
}

/* -------------------------
   Componente principal
--------------------------*/
export default function ResidentsCharts({ data }: { data: Resident[] }) {
  // Hooks siempre arriba
  const [search, setSearch] = useState("");
  const [filterTower, setFilterTower] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterFeeType, setFilterFeeType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>(""); // YYYY-MM-DD

  const today = useMemo(() => new Date(), []);

  // Opciones para selects (computed once)
  const towers = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      const t = (r.tower ?? "").toString().trim();
      if (t) set.add(t);
    });
    return Array.from(set);
  }, [data]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => set.add(r.role ?? "sin rol"));
    return Array.from(set);
  }, [data]);

  const users = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((r) => {
      if (r.user?.id)
        map.set(r.user.id, `${r.user.name} ${r.user.lastName ?? ""}`.trim());
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [data]);

  const feeTypes = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      (r.adminFees || []).forEach((f) => {
        if (f?.type) set.add(f.type);
      });
    });
    return Array.from(set);
  }, [data]);

  // FILTRO PRINCIPAL: residentes que cumplen filtros (y busqueda)
  const filteredResidents = useMemo(() => {
    const txt = (search || "").toLowerCase().trim();

    return data.filter((r) => {
      // filtro de texto sobre user, torre, apt, placa, role
      const name = (r.user?.name ?? "").toLowerCase();
      const last = (r.user?.lastName ?? "").toLowerCase();
      const role = (r.role ?? "").toLowerCase();
      const tower = (r.tower ?? "").toString().toLowerCase();
      const apt = (r.apartment ?? "").toString().toLowerCase();
      const plaque = (r.plaque ?? "").toString().toLowerCase();

      if (txt) {
        const matchesText =
          name.includes(txt) ||
          last.includes(txt) ||
          role.includes(txt) ||
          tower.includes(txt) ||
          apt.includes(txt) ||
          plaque.includes(txt);
        if (!matchesText) return false;
      }

      if (filterTower !== "all" && (r.tower ?? "") !== filterTower)
        return false;
      if (filterRole !== "all" && (r.role ?? "") !== filterRole) return false;
      if (filterUser !== "all" && (r.user?.id ?? "") !== filterUser)
        return false;

      // adminFees filter handled later when mapping fees (we still keep resident even if no fees)
      return true;
    });
  }, [data, search, filterTower, filterRole, filterUser]);

  // A partir de los residentes filtrados, obtener todos los adminFees aplicando filterFeeType y rango de fechas
  const filteredFees = useMemo(() => {
    const fromTime = dateFrom
      ? new Date(dateFrom + "T00:00:00").getTime()
      : null;
    const toTime = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

    const fees: {
      residentId: string;
      tower: string;
      apartment: string;
      userId: string;
      userName: string;
      amount: number;
      dueDate: string | null;
      dueMonthKey: string | null;
      type: string;
      description?: string;
      original: AdminFee;
    }[] = [];

    filteredResidents.forEach((r) => {
      (r.adminFees || []).forEach((f) => {
        if (!f) return;
        if (filterFeeType !== "all" && f.type !== filterFeeType) return;

        const dueDateRaw = f.dueDate ?? null;
        const dueTime = dueDateRaw
          ? new Date(dueDateRaw + "T00:00:00").getTime()
          : null;

        if (fromTime !== null && (dueTime === null || dueTime < fromTime))
          return;
        if (toTime !== null && (dueTime === null || dueTime > toTime)) return;

        const amount = safeParseAmount(f.amount);
        const dueMonthKey = monthKeyFromDateString(dueDateRaw ?? undefined);

        fees.push({
          residentId: r.id,
          tower: (r.tower ?? "").toString() || "Sin torre",
          apartment: (r.apartment ?? "").toString() || "Sin apto",
          userId: r.user?.id ?? "",
          userName: `${r.user?.name ?? ""} ${r.user?.lastName ?? ""}`.trim(),
          amount,
          dueDate: dueDateRaw,
          dueMonthKey,
          type: f.type ?? "Otro",
          description: f.description,
          original: f,
        });
      });
    });

    return fees;
  }, [filteredResidents, filterFeeType, dateFrom, dateTo]);

  /* ------------------------
     Métricas y datasets para gráficos
  -------------------------*/

  // Total recaudable (suma de todos los adminFees que pasan filtros)
  const totalRecaudable = useMemo(
    () => filteredFees.reduce((s, f) => s + f.amount, 0),
    [filteredFees]
  );

  // Recaudo por tipo (pie)
  const feesByType = useMemo(() => {
    const map: Record<string, number> = {};
    filteredFees.forEach((f) => {
      map[f.type] = (map[f.type] || 0) + f.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredFees]);

  // Recaudo por mes (line) - sum amount grouped by dueMonthKey (sorted)
  const feesByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filteredFees.forEach((f) => {
      const k = f.dueMonthKey ?? "sin-fecha";
      map[k] = (map[k] || 0) + f.amount;
    });
    const arr = Object.entries(map)
      .map(([month, value]) => ({ month, value }))
      .filter((x) => x.month !== "sin-fecha")
      .sort((a, b) => a.month.localeCompare(b.month));
    return arr;
  }, [filteredFees]);

  // Vencidos vs por vencer por mes (stacked bar)
  const feesOverdueVsFutureByMonth = useMemo(() => {
    const map: Record<string, { overdue: number; future: number }> = {};

    filteredFees.forEach((f) => {
      const month = f.dueMonthKey ?? "sin-fecha";
      if (!map[month]) map[month] = { overdue: 0, future: 0 };

      if (f.dueDate) {
        const due = new Date(f.dueDate + "T00:00:00");
        if (due.getTime() < today.getTime()) map[month].overdue += f.amount;
        else map[month].future += f.amount;
      } else {
        // if no dueDate, treat as future
        map[month].future += f.amount;
      }
    });

    // convert to array sorted
    return Object.entries(map)
      .map(([month, { overdue, future }]) => ({ month, overdue, future }))
      .filter((x) => x.month !== "sin-fecha")
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredFees, today]);

  // Top 5 apartamentos con mayor deuda (suma amounts)
  const topDebtors = useMemo(() => {
    const map: Record<string, { name: string; total: number }> = {};
    filteredFees.forEach((f) => {
      const key = `${f.tower} - ${f.apartment}`;
      if (!map[key]) map[key] = { name: key, total: 0 };
      map[key].total += f.amount;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredFees]);

  // Conteos / KPIs
  const totalResidents = filteredResidents.length;
  const countFees = filteredFees.length;
  const countOverdue = useMemo(
    () =>
      filteredFees.filter((f) =>
        f.dueDate
          ? new Date(f.dueDate + "T00:00:00").getTime() < today.getTime()
          : false
      ).length,
    [filteredFees, today]
  );

  /* -------------------------
     RENDER
  --------------------------*/
  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Title as="h3" font="semi" size="sm">
            Panel Administrador
          </Title>
          <Text>Conjunto: {data[0]?.conjunto?.name ?? "—"}</Text>
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border px-3 py-2 rounded"
            placeholder="Buscar por nombre, torre, apto, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterTower}
            onChange={(e) => setFilterTower(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">Todas las torres</option>
            {towers.map((t) => (
              <option key={t} value={t}>
                Torre {t}
              </option>
            ))}
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">Todos los roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">Todos los usuarios</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>

          <select
            value={filterFeeType}
            onChange={(e) => setFilterFeeType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">Todos los tipos de cuota</option>
            {feeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <Text>Total Residentes</Text>
          <div className="text-2xl font-bold">{totalResidents - 1}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <Text>Cuotas encontradas</Text>
          <div className="text-2xl font-bold">{countFees}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <Text>Total Recaudable</Text>
          <div className="text-2xl font-bold text-blue-600">
            ${totalRecaudable.toLocaleString("es-CO")}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <Text>Cuotas vencidas</Text>
          <div className="text-2xl font-bold text-red-600">{countOverdue}</div>
        </div>
      </section>

      {/* Grid de gráficos - 2 columnas en desktop */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recaudo por tipo (pie) */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Recaudo por Tipo de Cuota</Text>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feesByType}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {feesByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recaudo mensual (line) */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Recaudo por Mes (según dueDate)</Text>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vencidos vs Por vencer por mes (stacked bar) */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Vencidos vs Por Vencer (por mes)</Text>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesOverdueVsFutureByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(v: number) => `$${v?.toLocaleString("es-CO")}`}
                />
                <Legend />
                <Bar
                  dataKey="overdue"
                  stackId="a"
                  name="Vencido"
                  fill="#FF4444"
                />
                <Bar
                  dataKey="future"
                  stackId="a"
                  name="Por Vencer"
                  fill="#00C49F"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 deudores */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Top 5 Apartamentos con Mayor Deuda</Text>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDebtors.map((t) => ({ name: t.name, value: t.total }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
                />
                <Bar dataKey="value" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen por torre */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Recaudo por Torre</Text>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(() => {
                  const map: Record<string, number> = {};
                  filteredFees.forEach((f) => {
                    map[f.tower] = (map[f.tower] || 0) + f.amount;
                  });
                  return Object.entries(map).map(([name, value]) => ({
                    name,
                    value,
                  }));
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
                />
                <Bar dataKey="value" fill="#A28BFE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -------- Pie: Recaudo por tipo -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Recaudo por Tipo de Cuota</Text>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={feesByType}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {feesByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* -------- Line: Recaudo por mes -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Recaudo por Mes</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={feesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0088FE"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* -------- Stacked Bar: Vencidos vs Por vencer -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Vencidos vs Por Vencer (por mes)</Text>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={feesOverdueVsFutureByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
              <Legend />
              <Bar
                dataKey="overdue"
                stackId="a"
                name="Vencido"
                fill="#FF4444"
              />
              <Bar
                dataKey="future"
                stackId="a"
                name="Por Vencer"
                fill="#00C49F"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* -------- Top 5 deudores -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text className="mb-2">Top 5 Apartamentos con Mayor Deuda</Text>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={topDebtors.map((t) => ({ name: t.name, value: t.total }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
              <Bar dataKey="value" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* -------- NUEVO 1: Doughnut chart por usuario -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text>Monto total por Usuario</Text>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                innerRadius={60}
                outerRadius={100}
                data={(() => {
                  const map: Record<string, number> = {};
                  filteredFees.forEach((f) => {
                    map[f.userName] = (map[f.userName] || 0) + f.amount;
                  });
                  return Object.entries(map).map(([name, value]) => ({
                    name,
                    value,
                  }));
                })()}
                dataKey="value"
                nameKey="name"
              >
                {filteredFees.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* -------- NUEVO 2: AreaChart acumulado -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text>Recaudo Acumulado Mensual</Text>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart
              data={(() => {
                let cumulative = 0;
                return feesByMonth.map((m) => {
                  cumulative += m.value;
                  return { month: m.month, cumulative };
                });
              })()}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0088FE" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#0088FE" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#0088FE"
                fill="url(#colorA)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* -------- NUEVO 3: Radar chart por torre -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text>Comparación de Deuda por Torre</Text>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart
              data={(() => {
                const map: Record<string, number> = {};
                filteredFees.forEach((f) => {
                  map[f.tower] = (map[f.tower] || 0) + f.amount;
                });
                return Object.entries(map).map(([tower, value]) => ({
                  tower,
                  value,
                }));
              })()}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="tower" />
              <PolarRadiusAxis />
              <Radar
                dataKey="value"
                fill="#00C49F"
                fillOpacity={0.6}
                stroke="#00C49F"
              />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* -------- NUEVO 4: Scatter - Cuotas vs Monto -------- */}
        <div className="bg-white p-4 rounded shadow" style={{ height: 360 }}>
          <Text>Relación Cantidad Cuotas vs Total Adeudado</Text>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="count" name="Cuotas" />
              <YAxis dataKey="total" name="Total" />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-CO")}`}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter
                data={(() => {
                  const map: Record<string, { count: number; total: number }> =
                    {};

                  filteredFees.forEach((f) => {
                    if (!map[f.userId]) map[f.userId] = { count: 0, total: 0 };
                    map[f.userId].count++;
                    map[f.userId].total += f.amount;
                  });

                  return Object.values(map);
                })()}
                fill="#AA00FF"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
