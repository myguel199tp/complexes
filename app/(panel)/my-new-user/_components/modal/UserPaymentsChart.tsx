"use client";

import { useMemo } from "react";
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
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Text, Tooltip as Toolt } from "complexes-next-components";
import {
  FaCircleInfo,
  FaSackDollar,
  FaTriangleExclamation,
  FaBan,
  FaPercent,
  FaClipboardList,
} from "react-icons/fa6";
import { AdminFee } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

// ================= CONST =================

const COLORES = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const GRID_PROPS = { strokeDasharray: "3 3", stroke: "#f0f0f0", vertical: false };
const ESTADO_COLORS: Record<string, string> = {
  Pagadas: "#10b981",
  Pendientes: "#f59e0b",
  Rechazadas: "#ef4444",
};

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

const parseMonto = (m?: string | number) => {
  if (typeof m === "number") return m;
  const n = Number(m?.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// Estados que cuentan como "pendiente de pago".
const PENDIENTE = ["PENDING", "NOTIFIED", "OVERDUE"];

interface Props {
  nombre?: string;
  fees?: AdminFee[];
}

// ================= COMPONENT =================

export default function UserPaymentsChart({ nombre, fees = [] }: Props) {
  // ---- Totales / KPIs ----
  const { totalPagado, totalPendiente, totalRechazado } = useMemo(() => {
    let pagado = 0;
    let pendiente = 0;
    let rechazado = 0;
    fees.forEach((f) => {
      const monto = parseMonto(f.amount);
      if (f.status === "APPROVED") pagado += monto;
      else if (f.status === "REJECTED") rechazado += monto;
      else if (PENDIENTE.includes(f.status)) pendiente += monto;
    });
    return { totalPagado: pagado, totalPendiente: pendiente, totalRechazado: rechazado };
  }, [fees]);

  const cumplimiento =
    totalPagado + totalPendiente > 0
      ? (totalPagado / (totalPagado + totalPendiente)) * 100
      : 0;

  // ---- Estado de cuotas (donut) ----
  const estadoCuotas = useMemo(() => {
    let pagadas = 0;
    let pendientes = 0;
    let rechazadas = 0;
    fees.forEach((f) => {
      if (f.status === "APPROVED") pagadas++;
      else if (f.status === "REJECTED") rechazadas++;
      else if (PENDIENTE.includes(f.status)) pendientes++;
    });
    return [
      { name: "Pagadas", value: pagadas },
      { name: "Pendientes", value: pendientes },
      { name: "Rechazadas", value: rechazadas },
    ].filter((e) => e.value > 0);
  }, [fees]);

  // ---- Pagado por mes ----
  const pagadoPorMes = useMemo(() => {
    const map = new Map<string, number>();
    fees.forEach((f) => {
      if (f.status !== "APPROVED" || !f.dueDate) return;
      const mes = f.dueDate.slice(0, 7);
      map.set(mes, (map.get(mes) || 0) + parseMonto(f.amount));
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, total]) => ({ mes, total }));
  }, [fees]);

  // ---- Acumulado pagado ----
  const acumulado = useMemo(() => {
    let acc = 0;
    return pagadoPorMes.map((m) => {
      acc += m.total;
      return { mes: m.mes, acumulado: acc };
    });
  }, [pagadoPorMes]);

  // ---- Monto por tipo de cuota ----
  const montoPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    fees.forEach((f) => {
      if (f.status !== "APPROVED") return;
      const tipo = f.type || "Otros";
      map.set(tipo, (map.get(tipo) || 0) + parseMonto(f.amount));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [fees]);

  if (fees.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
        Este propietario no tiene cuotas registradas.
      </div>
    );
  }

  return (
    <div className="p-1 space-y-5">
      {nombre && (
        <p className="text-sm text-gray-500">
          Resumen de pagos de <span className="font-semibold text-gray-800">{nombre}</span>
        </p>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI titulo="Total pagado" valor={totalPagado} icon={FaSackDollar} verde
          tool="Suma de cuotas aprobadas de este propietario." />
        <KPI titulo="Pendiente" valor={totalPendiente} icon={FaTriangleExclamation} rojo
          tool="Cuotas pendientes, notificadas o en mora." />
        <KPI titulo="Rechazado" valor={totalRechazado} icon={FaBan}
          tool="Cuotas cuyo comprobante fue rechazado." />
        <KPI titulo="Cumplimiento" valor={cumplimiento} isPercent icon={FaPercent}
          warning={cumplimiento < 80}
          tool="% pagado sobre el total exigible (pagado + pendiente)." />
        <KPI titulo="N° de cuotas" valor={fees.length} isMoney={false} icon={FaClipboardList} azul
          tool="Cantidad total de cuotas del propietario." />
      </section>

      {/* GRÁFICAS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard titulo="Estado de cuotas" descripcion="Distribución por estado de pago">
          <DonutChart data={estadoCuotas} colorMap={ESTADO_COLORS} />
        </ChartCard>

        <ChartCard titulo="Pagado por mes" descripcion="Cuotas aprobadas agrupadas por mes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pagadoPorMes}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatMoney(v), "Pagado"]} labelFormatter={formatMes} />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} name="Pagado" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Pago acumulado" descripcion="Total pagado acumulado en el tiempo">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={acumulado}>
              <defs>
                <linearGradient id="gradUserAcum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatMoney(v), "Acumulado"]} labelFormatter={formatMes} />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="#2563eb"
                fill="url(#gradUserAcum)"
                strokeWidth={2.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Pagado por tipo de cuota" descripcion="Distribución de lo pagado por tipo">
          {montoPorTipo.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Sin cuotas pagadas
            </div>
          ) : (
            <DonutChart data={montoPorTipo} isMoney />
          )}
        </ChartCard>
      </section>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

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
      <div className={`text-xl font-bold ${color} truncate mt-1`}>
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
    <div className="bg-white border border-gray-100 rounded-2xl p-4 h-72 w-full overflow-hidden shadow-sm">
      <div className="mb-2">
        <p className="font-semibold text-gray-800 text-sm">{titulo}</p>
        {descripcion && <p className="text-xs text-gray-400 mt-0.5">{descripcion}</p>}
      </div>
      <div className="w-full h-[85%]">{children}</div>
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
