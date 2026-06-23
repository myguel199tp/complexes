/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState } from "react";
import { Text, Tooltip as Toolt } from "complexes-next-components";
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
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import useFeePaymentsTable from "@/app/(panel)/my-fees/_components/useActivitTable";
import { useVisits } from "@/app/(panel)/my-citofonia/components/table/use-visit-query";
import { Responsive, WidthProvider } from "react-grid-layout";

import {
  FaCircleInfo,
  FaSackDollar,
  FaCarSide,
  FaChartLine,
  FaMoneyBillWave,
  FaScaleBalanced,
  FaTriangleExclamation,
  FaPercent,
  FaUserClock,
  FaClipboardList,
} from "react-icons/fa6";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  AdminFee,
  EnsembleResponse,
} from "@/app/(sets)/ensemble/service/response/ensembleResponse";

// ================= TYPES =================

interface Gasto {
  amount: string;
  paymentDate?: string;
  category?: { name?: string };
}

interface FeeConfig {
  id: string;
  amount: number | string;
  feeType?: string;
  recommendedSchedule?: string;
  lastPaymentDate?: string;
  createdAt?: string;
  monthsToGenerate?: number;
  specificMonths?: number[];
}

interface Visit {
  id: string;
  plate: string;
  entryDate: string;
  exitDate?: string;
  residentId?: string;
}

interface Props {
  data?: EnsembleResponse[];
  expenses?: Gasto[];
  visits?: Visit[];
}

interface MesData {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  flujo: number;
}

// ================= CONST =================

const COLORES = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const GRID_PROPS = { strokeDasharray: "3 3", stroke: "#f0f0f0", vertical: false };
const ESTADO_COLORS: Record<string, string> = {
  Pagadas: "#10b981",
  Pendientes: "#f59e0b",
  Rechazadas: "#ef4444",
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const layout = [
  { i: "saldo", x: 0, y: 0, w: 6, h: 3 },
  { i: "ingresos", x: 6, y: 0, w: 6, h: 3 },
  { i: "balance", x: 0, y: 3, w: 6, h: 3 },
  { i: "morosidad", x: 6, y: 3, w: 6, h: 3 },
  { i: "deudores", x: 0, y: 6, w: 6, h: 3 },
  { i: "tipos", x: 6, y: 6, w: 6, h: 3 },
  { i: "mes", x: 0, y: 9, w: 6, h: 3 },
  { i: "torre", x: 6, y: 9, w: 6, h: 3 },
  { i: "gastos", x: 0, y: 12, w: 6, h: 3 },
  { i: "cuotas", x: 6, y: 12, w: 6, h: 3 },
  { i: "parkingIngresos", x: 0, y: 15, w: 6, h: 3 },
  { i: "parqueo", x: 6, y: 15, w: 6, h: 3 },
  { i: "estadoparqueo", x: 0, y: 18, w: 6, h: 3 },
];

const formatMoney = (value: number) => `$${value.toLocaleString("es-CO")}`;

const formatMoneyKPI = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toLocaleString("es-CO")}`;
};

const formatMes = (mes: string) => {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
};

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

// ================= COMPONENT =================

export default function DashboardUltra({ data = [], expenses = [] }: Props) {
  const { data: feeData } = useFeePaymentsTable();
  const { data: visits = [] } = useVisits();

  const feesConfig: FeeConfig[] = (feeData ?? [])
    .filter((f) => f.amount != null)
    .map((f) => ({
      id: f.id,
      amount: Number(f.amount),
      feeType: f.feeType,
      recommendedSchedule: f.recommendedSchedule,
      lastPaymentDate: f.lastPaymentDate,
      createdAt: f.createdAt,
      monthsToGenerate: f.monthsToGenerate,
      specificMonths: f.specificMonths,
    }));

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState<number | "all">("all");
  const [filtroTorre, setFiltroTorre] = useState("all");
  const [filtroAnio, setFiltroAnio] = useState("all");

  const parseMonto = (m?: string | number) => {
    if (typeof m === "number") return m;
    const n = Number(m?.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const enRango = (fecha?: string) => {
    if (!fecha) return true;
    const f = new Date(fecha);
    if (filtroAnio !== "all" && f.getFullYear() !== Number(filtroAnio)) return false;
    if (mesSeleccionado !== "all" && f.getMonth() + 1 !== mesSeleccionado) return false;
    if (fechaInicio && f < new Date(fechaInicio)) return false;
    if (fechaFin && f > new Date(fechaFin)) return false;
    return true;
  };

  // ================= FILTROS DERIVADOS =================

  const residentesFiltrados = useMemo(
    () => (filtroTorre === "all" ? data : data.filter((r) => r.tower === filtroTorre)),
    [data, filtroTorre],
  );

  const torresDisponibles = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => r.tower && set.add(r.tower));
    return Array.from(set).sort();
  }, [data]);

  const aniosDisponibles = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) =>
      r.adminFees?.forEach((f) => {
        if (f.dueDate) set.add(f.dueDate.slice(0, 4));
      }),
    );
    expenses.forEach((g) => {
      if (g.paymentDate) set.add(g.paymentDate.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [data, expenses]);

  const filtrosActivos = [
    fechaInicio,
    fechaFin,
    filtroTorre !== "all",
    filtroAnio !== "all",
    mesSeleccionado !== "all",
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setMesSeleccionado("all");
    setFiltroTorre("all");
    setFiltroAnio("all");
  };

  // ================= INGRESOS / GASTOS =================

  const cuotas = useMemo(() => {
    const arr: AdminFee[] = [];
    residentesFiltrados.forEach((r) =>
      r.adminFees
        ?.filter((f) => f.status === "APPROVED")
        .forEach((f) => {
          if (enRango(f.dueDate)) arr.push(f);
        }),
    );
    return arr;
  }, [residentesFiltrados, fechaInicio, fechaFin, filtroAnio, mesSeleccionado]);

  const gastosFiltrados = useMemo(
    () => expenses.filter((g) => enRango(g.paymentDate)),
    [expenses, fechaInicio, fechaFin, filtroAnio, mesSeleccionado],
  );

  const totalIngresos = cuotas.reduce((s, f) => s + parseMonto(f.amount), 0);
  const totalGastos = gastosFiltrados.reduce((s, g) => s + parseMonto(g.amount), 0);
  const balanceTotal = totalIngresos - totalGastos;

  // ================= FINANZAS =================

  const finanzas = useMemo<MesData[]>(() => {
    const map = new Map<string, MesData>();

    cuotas.forEach((c) => {
      if (!c.dueDate) return;
      const mes = c.dueDate.slice(0, 7);
      if (!map.has(mes)) map.set(mes, { mes, ingresos: 0, gastos: 0, balance: 0, flujo: 0 });
      map.get(mes)!.ingresos += parseMonto(c.amount);
    });

    gastosFiltrados.forEach((g) => {
      if (!g.paymentDate) return;
      const mes = g.paymentDate.slice(0, 7);
      if (!map.has(mes)) map.set(mes, { mes, ingresos: 0, gastos: 0, balance: 0, flujo: 0 });
      map.get(mes)!.gastos += parseMonto(g.amount);
    });

    let flujo = 0;
    return Array.from(map.values())
      .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime())
      .map((m) => {
        const balance = m.ingresos - m.gastos;
        flujo += balance;
        return { ...m, balance, flujo };
      });
  }, [cuotas, gastosFiltrados]);

  // ================= DEUDA =================

  const totalDeuda = residentesFiltrados.reduce(
    (s, r) =>
      s +
      (r.adminFees
        ?.filter((f) => f.status === "PENDING")
        .reduce((sum, f) => sum + parseMonto(f.amount), 0) || 0),
    0,
  );

  const residentesEnMora = residentesFiltrados.filter((r) =>
    r.adminFees?.some((f) => f.status === "PENDING"),
  ).length;

  const topDeudores = residentesFiltrados
    .map((r) => {
      const pendientes = r.adminFees?.filter((f) => f.status === "PENDING") || [];
      const deuda = pendientes.reduce((s, f) => s + parseMonto(f.amount), 0);
      const meses = pendientes.map((f) =>
        new Date(f.dueDate || "").toLocaleString("es-CO", { month: "long", year: "numeric" }),
      );
      return {
        nombre:
          `${r.user?.name ?? ""} ${r.user?.lastName ?? ""}`.trim() ||
          `Apto ${r.apartment ?? "-"}`,
        deuda,
        meses: meses.join(", "),
      };
    })
    .filter((r) => r.deuda > 0)
    .sort((a, b) => b.deuda - a.deuda)
    .slice(0, 5);

  // ================= MOROSIDAD POR MES =================

  const tasaMorosidad = useMemo(() => {
    const map = new Map<string, { total: number; pendientes: number }>();
    residentesFiltrados.forEach((r) =>
      r.adminFees?.forEach((f) => {
        if (!f.dueDate || !enRango(f.dueDate)) return;
        const mes = f.dueDate.slice(0, 7);
        if (!map.has(mes)) map.set(mes, { total: 0, pendientes: 0 });
        map.get(mes)!.total++;
        if (f.status === "PENDING") map.get(mes)!.pendientes++;
      }),
    );
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, { total, pendientes }]) => ({
        mes,
        tasa: total > 0 ? Math.round((pendientes / total) * 100) : 0,
      }));
  }, [residentesFiltrados, fechaInicio, fechaFin, filtroAnio, mesSeleccionado]);

  // ================= CONFIG =================

  const totalConfigurado = useMemo(
    () => feesConfig.reduce((s, f) => s + parseMonto(f.amount), 0),
    [feesConfig],
  );

  const tiposCuotas = useMemo(() => {
    const map = new Map<string, number>();
    feesConfig.forEach((f) => {
      const tipo = f.feeType || "Otros";
      map.set(tipo, (map.get(tipo) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [feesConfig]);

  const feesFiltradasPorMes = useMemo(
    () =>
      mesSeleccionado === "all"
        ? feesConfig
        : feesConfig.filter((f) => f.specificMonths?.includes(mesSeleccionado as number)),
    [feesConfig, mesSeleccionado],
  );

  const configuracionPorMes = useMemo(() => {
    const map = new Map<number, number>();
    feesFiltradasPorMes.forEach((f) => {
      f.specificMonths?.forEach((mes) => {
        map.set(mes, (map.get(mes) || 0) + parseMonto(f.amount));
      });
    });
    return Array.from(map.entries()).map(([mes, valor]) => ({
      mes: new Date(2024, mes - 1).toLocaleString("es-CO", { month: "short" }),
      valor,
    }));
  }, [feesFiltradasPorMes]);

  const deudaPorTorre = useMemo(() => {
    const map = new Map<string, number>();
    residentesFiltrados.forEach((r) => {
      const torre = r.tower || "Sin torre";
      const deuda =
        r.adminFees
          ?.filter((f) => f.status === "PENDING")
          .reduce((s, f) => s + parseMonto(f.amount), 0) || 0;
      map.set(torre, (map.get(torre) || 0) + deuda);
    });
    return Array.from(map.entries()).map(([torre, deuda]) => ({ torre, deuda }));
  }, [residentesFiltrados]);

  const gastosPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    gastosFiltrados.forEach((g) => {
      const categoria = g.category?.name || "Otros";
      map.set(categoria, (map.get(categoria) || 0) + parseMonto(g.amount));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [gastosFiltrados]);

  const estadoCuotas = useMemo(() => {
    let pagadas = 0;
    let pendientes = 0;
    let rechazadas = 0;
    residentesFiltrados.forEach((r) =>
      r.adminFees?.forEach((f) => {
        if (!enRango(f.dueDate)) return;
        if (f.status === "APPROVED") pagadas++;
        if (f.status === "PENDING") pendientes++;
        if (f.status === "REJECTED") rechazadas++;
      }),
    );
    return [
      { name: "Pagadas", value: pagadas },
      { name: "Pendientes", value: pendientes },
      { name: "Rechazadas", value: rechazadas },
    ];
  }, [residentesFiltrados, fechaInicio, fechaFin, filtroAnio, mesSeleccionado]);

  // ================= KPIs =================

  const cumplimientoReal = totalConfigurado ? (totalIngresos / totalConfigurado) * 100 : 0;

  const alerta =
    totalGastos > totalIngresos
      ? "Gastos superan ingresos"
      : cumplimientoReal < 70
        ? "Bajo recaudo — menos del 70% cobrado"
        : null;

  // ================= PARQUEADERO =================

  const calcularHoras = (entry: string, exit?: string) => {
    if (!exit) return 0;
    return (new Date(exit).getTime() - new Date(entry).getTime()) / 3600000;
  };

  const usoParking = useMemo(() => {
    let con = 0;
    let sin = 0;
    visits.forEach((v) => {
      if (v.hasParking) con++;
      else sin++;
    });
    return [
      { name: "Con parqueadero", value: con },
      { name: "Sin parqueadero", value: sin },
    ];
  }, [visits]);

  const ingresosParkingMes = useMemo(() => {
    const map = new Map<string, number>();
    visits.forEach((v) => {
      if (!v.hasParking || v.paymentStatus !== "APPROVED") return;
      const mes = v.entryTime.slice(0, 7);
      const horas = calcularHoras(v.entryTime, v.exitTime);
      map.set(mes, (map.get(mes) || 0) + horas * (v.parkingRatePerHour || 0));
    });
    return Array.from(map.entries()).map(([mes, total]) => ({ mes, total }));
  }, [visits]);

  const estadoPagosParking = useMemo(() => {
    const map = new Map<string, number>();
    visits.forEach((v) => {
      if (!v.hasParking) return;
      const estado = v.paymentStatus || "NONE";
      map.set(estado, (map.get(estado) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [visits]);

  const ingresosParking = useMemo(
    () =>
      visits
        .filter((v) => v.hasParking && v.paymentStatus === "APPROVED")
        .reduce(
          (total, v) =>
            total + calcularHoras(v.entryTime, v.exitTime) * (v.parkingRatePerHour || 0),
          0,
        ),
    [visits],
  );

  const ingresosTotales = totalIngresos + ingresosParking;

  // ================= UI =================

  return (
    <main className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {alerta && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl font-semibold flex items-center gap-2 text-sm">
          ⚠️ {alerta}
        </div>
      )}

      {/* FILTROS */}
      <section className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 text-sm">Filtros</span>
            {filtrosActivos > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </div>
          {filtrosActivos > 0 && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <FilterField label="Desde">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </FilterField>

          <FilterField label="Hasta">
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </FilterField>

          <FilterField label="Año">
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todos los años</option>
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Torre">
            <select
              value={filtroTorre}
              onChange={(e) => setFiltroTorre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todas las torres</option>
              {torresDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Mes de cuota">
            <select
              value={mesSeleccionado}
              onChange={(e) =>
                setMesSeleccionado(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todos los meses</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(2024, i).toLocaleString("es-CO", { month: "long" })}
                </option>
              ))}
            </select>
          </FilterField>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid md:grid-cols-3 xl:grid-cols-9 gap-4">
        <KPI
          titulo="Ingresos cuotas"
          valor={totalIngresos}
          tool="Cuotas de administración pagadas en el período."
          icon={FaSackDollar}
          verde
        />
        <KPI
          titulo="Ingresos parqueadero"
          valor={ingresosParking}
          tool="Ingresos por uso del parqueadero por visitantes."
          icon={FaCarSide}
          verde
        />
        <KPI
          titulo="Ingresos totales"
          valor={ingresosTotales}
          tool="Suma de cuotas + parqueadero."
          icon={FaChartLine}
          azul
        />
        <KPI
          titulo="Gastos"
          valor={totalGastos}
          tool="Gastos operativos registrados en el período."
          icon={FaMoneyBillWave}
          rojo
        />
        <KPI
          titulo="Balance"
          valor={balanceTotal}
          tool="Ingresos totales menos gastos."
          icon={FaScaleBalanced}
          verde={balanceTotal > 0}
          rojo={balanceTotal < 0}
        />
        <KPI
          titulo="Deuda total"
          valor={totalDeuda}
          tool="Suma de cuotas pendientes de pago."
          icon={FaTriangleExclamation}
          rojo
        />
        <KPI
          titulo="Cumplimiento"
          valor={cumplimientoReal}
          isPercent
          tool="% de cuotas pagadas vs configuradas."
          icon={FaPercent}
          warning={cumplimientoReal < 80}
        />
        <KPI
          titulo="En mora"
          valor={residentesEnMora}
          isMoney={false}
          tool="Número de residentes con al menos una cuota pendiente."
          icon={FaUserClock}
          rojo
        />
        <KPI
          titulo="Visitas parking"
          valor={visits.length}
          isMoney={false}
          tool="Total de visitas registradas."
          icon={FaClipboardList}
          azul
        />
      </section>

      {/* GRÁFICAS */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 2 }}
        rowHeight={100}
        compactType="vertical"
        preventCollision={false}
      >
        {/* Saldo acumulado */}
        <div key="saldo">
          <ChartCard titulo="Saldo acumulado" descripcion="Flujo de caja acumulado en el tiempo">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finanzas}>
                <defs>
                  <linearGradient id="gradFlujo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [formatMoney(v), "Saldo"]} />
                <Area
                  type="monotone"
                  dataKey="flujo"
                  stroke="#2563eb"
                  fill="url(#gradFlujo)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Ingresos vs Gastos */}
        <div key="ingresos">
          <ChartCard
            titulo="Ingresos vs Gastos"
            descripcion="Comparativa mensual de ingresos y egresos"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={finanzas}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 5 }}
                  name="Ingresos"
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 5 }}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Balance mensual — NUEVO */}
        <div key="balance">
          <ChartCard
            titulo="Balance mensual"
            descripcion="Resultado neto por mes — verde superávit, rojo déficit"
          >
            {finanzas.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finanzas}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [formatMoney(v), "Balance"]} />
                  <ReferenceLine y={0} stroke="#9ca3af" />
                  <Bar dataKey="balance" name="Balance" radius={[4, 4, 0, 0]}>
                    {finanzas.map((entry, i) => (
                      <Cell key={i} fill={entry.balance >= 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Tasa de morosidad — NUEVO */}
        <div key="morosidad">
          <ChartCard
            titulo="Tasa de morosidad mensual"
            descripcion="% de cuotas pendientes por mes — alerta en 30%"
          >
            {tasaMorosidad.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tasaMorosidad}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Morosidad"]} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "30%", position: "right", fontSize: 10, fill: "#f59e0b" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tasa"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                    name="Morosidad"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Top deudores */}
        <div key="deudores">
          <ChartCard titulo="Top deudores" descripcion="Los 5 residentes con mayor deuda pendiente">
            {topDeudores.length === 0 ? (
              <EmptyChart mensaje="Sin deudores en el período" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDeudores} layout="vertical">
                  <CartesianGrid {...GRID_PROPS} horizontal={false} />
                  <XAxis type="number" tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={90}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return `${label} • ${item?.meses}`;
                    }}
                  />
                  <Bar dataKey="deuda" fill="#ef4444" radius={[0, 4, 4, 0]} name="Deuda" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Tipos de cuotas */}
        <div key="tipos">
          <ChartCard titulo="Tipos de cuotas" descripcion="Distribución de cuotas configuradas por tipo">
            <DonutChart data={tiposCuotas} />
          </ChartCard>
        </div>

        {/* Configuración por mes */}
        <div key="mes">
          <ChartCard titulo="Configuración por mes" descripcion="Valor configurado de cuotas por mes del año">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={configuracionPorMes}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [formatMoney(v), "Valor"]} />
                <Bar dataKey="valor" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Morosidad por torre */}
        <div key="torre">
          <ChartCard titulo="Morosidad por torre" descripcion="Deuda total pendiente agrupada por torre">
            {deudaPorTorre.length === 0 ? (
              <EmptyChart mensaje="Sin deuda por torre" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deudaPorTorre}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="torre" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [formatMoney(v), "Deuda"]} />
                  <Bar dataKey="deuda" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Gastos por categoría */}
        <div key="gastos">
          <ChartCard titulo="Gastos por categoría" descripcion="Distribución de gastos operativos">
            {gastosPorCategoria.length === 0 ? (
              <EmptyChart mensaje="Sin gastos en el período" />
            ) : (
              <DonutChart data={gastosPorCategoria} isMoney />
            )}
          </ChartCard>
        </div>

        {/* Estado de cuotas */}
        <div key="cuotas">
          <ChartCard titulo="Estado de cuotas" descripcion="Distribución por estado de pago en el período">
            <DonutChart data={estadoCuotas} colorMap={ESTADO_COLORS} />
          </ChartCard>
        </div>

        {/* Ingresos parqueadero por mes */}
        <div key="parkingIngresos">
          <ChartCard
            titulo="Ingresos parqueadero por mes"
            descripcion="Ingresos generados por visitantes con parqueadero"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ingresosParkingMes}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [formatMoney(v), "Ingresos"]} />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Uso de parqueadero */}
        <div key="parqueo">
          <ChartCard titulo="Uso del parqueadero" descripcion="Visitas con y sin parqueadero">
            <DonutChart data={usoParking} />
          </ChartCard>
        </div>

        {/* Estado pagos parqueadero */}
        <div key="estadoparqueo">
          <ChartCard
            titulo="Estado pagos — parqueadero"
            descripcion="Estado de pago de visitas con parqueadero"
          >
            <DonutChart data={estadoPagosParking} />
          </ChartCard>
        </div>
      </ResponsiveGridLayout>
    </main>
  );
}

// ================= SUB-COMPONENTS =================

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

function KPI({
  titulo,
  valor,
  verde,
  rojo,
  azul,
  tool,
  isPercent,
  isMoney = true,
  warning,
  icon: Icon = FaSackDollar,
}: {
  titulo: string;
  valor: number;
  verde?: boolean;
  rojo?: boolean;
  azul?: boolean;
  tool?: string;
  isPercent?: boolean;
  isMoney?: boolean;
  warning?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const color = warning
    ? "text-yellow-600"
    : verde
      ? "text-green-600"
      : rojo
        ? "text-red-600"
        : azul
          ? "text-blue-600"
          : "text-gray-800";

  const iconBg = warning
    ? "bg-yellow-50 text-yellow-600"
    : verde
      ? "bg-green-50 text-green-600"
      : rojo
        ? "bg-red-50 text-red-600"
        : azul
          ? "bg-blue-50 text-blue-600"
          : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={15} />
        </div>
        {tool && (
          <Toolt
            content={tool}
            position="bottom"
            className="bg-gray-700 font-semibold text-white text-sm p-2 rounded w-64"
          >
            <FaCircleInfo className="text-gray-400 cursor-pointer shrink-0" />
          </Toolt>
        )}
      </div>
      <Text size="xs" className="text-gray-500">
        {titulo}
      </Text>
      <div
        className={`text-xl font-bold ${color} truncate mt-1`}
        title={
          isMoney && !isPercent
            ? formatMoney(valor)
            : isPercent
              ? `${valor.toFixed(2)}%`
              : valor.toLocaleString("es-CO")
        }
      >
        {isPercent
          ? `${valor.toFixed(1)}%`
          : isMoney
            ? formatMoneyKPI(valor)
            : valor.toLocaleString("es-CO")}
      </div>
    </div>
  );
}

function ChartCard({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 h-full w-full overflow-hidden shadow-sm">
      <div className="mb-2">
        <p className="font-semibold text-gray-800 text-sm">{titulo}</p>
        {descripcion && <p className="text-xs text-gray-400 mt-0.5">{descripcion}</p>}
      </div>
      <div className="w-full h-[85%]">{children}</div>
    </div>
  );
}

function EmptyChart({ mensaje = "Sin datos para mostrar" }: { mensaje?: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      {mensaje}
    </div>
  );
}

function DonutChart({
  data,
  colorMap,
  isMoney = false,
}: {
  data: { name: string; value: number }[];
  colorMap?: Record<string, string>;
  isMoney?: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-3 h-full">
      <div className="relative w-[50%] h-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colorMap?.[entry.name] ?? COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => (isMoney ? formatMoney(v) : v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-gray-900">
            {isMoney ? formatMoneyKPI(total) : total.toLocaleString("es-CO")}
          </span>
          <span className="text-[10px] text-gray-400">Total</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-full pr-1">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: colorMap?.[entry.name] ?? COLORES[i % COLORES.length] }}
              />
              <span className="text-gray-600 truncate">{entry.name}</span>
            </div>
            <span className="font-semibold text-gray-800 shrink-0">
              {isMoney ? formatMoney(entry.value) : `${total ? Math.round((entry.value / total) * 100) : 0}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
