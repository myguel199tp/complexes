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
} from "recharts";
import useFeePaymentsTable from "@/app/(panel)/my-fees/_components/useActivitTable";
import { FaCircleInfo } from "react-icons/fa6";
import { useVisits } from "@/app/(panel)/my-citofonia/components/table/use-visit-query";
import { Responsive, WidthProvider } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
// ================= TYPES =================

export enum FeeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

interface Usuario {
  id: string;
  name: string;
  lastName?: string;
}

interface Cuota {
  amount: string;
  type?: string;
  dueDate?: string;
  status: FeeStatus;
}

interface Residente {
  id: string;
  tower?: string;
  apartment?: string;
  user?: Usuario;
  adminFees?: Cuota[];
}

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
  data?: Residente[];
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

const COLORES = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const ResponsiveGridLayout = WidthProvider(Responsive);

const layout = [
  { i: "saldo", x: 0, y: 0, w: 6, h: 3 },

  { i: "ingresos", x: 6, y: 0, w: 6, h: 3 },

  { i: "deudores", x: 0, y: 3, w: 6, h: 3 },

  { i: "tipos", x: 6, y: 3, w: 6, h: 3 },

  { i: "mes", x: 0, y: 6, w: 6, h: 3 },

  { i: "torre", x: 6, y: 6, w: 6, h: 3 },

  { i: "gastos", x: 0, y: 9, w: 6, h: 3 },

  { i: "cuotas", x: 6, y: 9, w: 6, h: 3 },

  { i: "parkingIngresos", x: 0, y: 12, w: 6, h: 3 },

  { i: "parqueo", x: 6, y: 12, w: 6, h: 3 },

  { i: "estadoparqueo", x: 0, y: 15, w: 6, h: 3 },
];

const formatMoney = (value: number) => `$${value.toLocaleString("es-CO")}`;

const formatMes = (mes: string) => {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("es-CO", {
    month: "short",
    year: "numeric",
  });
};

// ================= COMPONENT =================

export default function DashboardUltra({ data = [], expenses = [] }: Props) {
  const { data: feeData } = useFeePaymentsTable();
  const { data: visits = [] } = useVisits();
  const feesConfig: FeeConfig[] = (feeData ?? [])
    .filter((f) => f.amount != null) // ❗ ignoras datos rotos
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
  const parseMonto = (m?: string | number) => {
    if (typeof m === "number") return m;
    const n = Number(m?.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  const enRango = (fecha?: string) => {
    if (!fecha) return true;
    const f = new Date(fecha);
    if (fechaInicio && f < new Date(fechaInicio)) return false;
    if (fechaFin && f > new Date(fechaFin)) return false;
    return true;
  };

  const residentes = data;

  // ================= INGRESOS / GASTOS =================

  const cuotas = useMemo(() => {
    const arr: Cuota[] = [];

    residentes.forEach((r) =>
      r.adminFees
        ?.filter((f) => f.status === "APPROVED")
        .forEach((f) => {
          if (enRango(f.dueDate)) arr.push(f);
        }),
    );

    return arr;
  }, [residentes, fechaInicio, fechaFin]);

  const gastosFiltrados = useMemo(
    () => expenses.filter((g) => enRango(g.paymentDate)),
    [expenses, fechaInicio, fechaFin],
  );

  const totalIngresos = cuotas.reduce((s, f) => s + parseMonto(f.amount), 0);

  const totalGastos = gastosFiltrados.reduce(
    (s, g) => s + parseMonto(g.amount),
    0,
  );

  const balanceTotal = totalIngresos - totalGastos;

  // ================= FINANZAS =================

  const finanzas = useMemo<MesData[]>(() => {
    const map = new Map<string, MesData>();

    cuotas.forEach((c) => {
      if (!c.dueDate) return;
      const mes = c.dueDate.slice(0, 7);

      if (!map.has(mes))
        map.set(mes, { mes, ingresos: 0, gastos: 0, balance: 0, flujo: 0 });

      map.get(mes)!.ingresos += parseMonto(c.amount);
    });

    gastosFiltrados.forEach((g) => {
      if (!g.paymentDate) return;
      const mes = g.paymentDate.slice(0, 7);

      if (!map.has(mes))
        map.set(mes, { mes, ingresos: 0, gastos: 0, balance: 0, flujo: 0 });

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

  const totalDeuda = residentes.reduce((s, r) => {
    return (
      s +
      (r.adminFees
        ?.filter((f) => f.status === "PENDING")
        .reduce((sum, f) => sum + parseMonto(f.amount), 0) || 0)
    );
  }, 0);

  const topDeudores = residentes
    .map((r) => {
      const pendientes =
        r.adminFees?.filter((f) => f.status === "PENDING") || [];

      const deuda = pendientes.reduce((s, f) => s + parseMonto(f.amount), 0);

      const meses = pendientes.map((f) =>
        new Date(f.dueDate || "").toLocaleString("es-CO", {
          month: "long",
          year: "numeric",
        }),
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

  // ================= CONFIG =================

  const totalConfigurado = useMemo(
    () => feesConfig.reduce((s, f) => s + parseMonto(f.amount), 0),
    [feesConfig],
  );

  // const sinGenerar = useMemo(
  //   () => feesConfig.filter((f) => !f.lastPaymentDate).length,
  //   [feesConfig],
  // );

  const tiposCuotas = useMemo(() => {
    const map = new Map<string, number>();

    feesConfig.forEach((f) => {
      const tipo = f.feeType || "Otros";
      map.set(tipo, (map.get(tipo) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [feesConfig]);

  const feesFiltradasPorMes = useMemo(() => {
    if (mesSeleccionado === "all") return feesConfig;

    return feesConfig.filter((f) =>
      f.specificMonths?.includes(mesSeleccionado),
    );
  }, [feesConfig, mesSeleccionado]);

  const configuracionPorMes = useMemo(() => {
    const map = new Map<number, number>();

    feesFiltradasPorMes.forEach((f) => {
      f.specificMonths?.forEach((mes) => {
        map.set(mes, (map.get(mes) || 0) + parseMonto(f.amount));
      });
    });

    return Array.from(map.entries()).map(([mes, valor]) => ({
      mes: new Date(2024, mes - 1).toLocaleString("es-CO", {
        month: "short",
      }),
      valor,
    }));
  }, [feesFiltradasPorMes]);

  const deudaPorTorre = useMemo(() => {
    const map = new Map<string, number>();

    residentes.forEach((r) => {
      const torre = r.tower || "Sin torre";
      console.log("r", r.adminFees);
      const deuda =
        r.adminFees
          ?.filter((f) => f.status === "PENDING")
          .reduce((s, f) => s + parseMonto(f.amount), 0) || 0;

      map.set(torre, (map.get(torre) || 0) + deuda);
    });

    return Array.from(map.entries()).map(([torre, deuda]) => ({
      torre,
      deuda,
    }));
  }, [residentes]);

  const gastosPorCategoria = useMemo(() => {
    const map = new Map<string, number>();

    gastosFiltrados.forEach((g) => {
      const categoria = g.category?.name || "Otros";

      map.set(categoria, (map.get(categoria) || 0) + parseMonto(g.amount));
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [gastosFiltrados]);
  const estadoCuotas = useMemo(() => {
    let pagadas = 0;
    let pendientes = 0;
    let rechazadas = 0;

    residentes.forEach((r) =>
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
  }, [residentes, fechaInicio, fechaFin]);

  // ================= KPIs =================

  const cumplimientoReal = totalConfigurado
    ? (totalIngresos / totalConfigurado) * 100
    : 0;

  const alerta =
    totalGastos > totalIngresos
      ? "Gastos superan ingresos"
      : cumplimientoReal < 70
        ? "Bajo recaudo"
        : null;

  // ================= UI =================

  const calcularHoras = (entry: string, exit?: string) => {
    if (!exit) return 0;

    const inicio = new Date(entry).getTime();
    const fin = new Date(exit).getTime();

    return (fin - inicio) / 3600000;
  };
  // parking
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
      if (!v.hasParking) return;
      if (v.paymentStatus !== "APPROVED") return;

      const mes = v.entryTime.slice(0, 7);

      const horas = calcularHoras(v.entryTime, v.exitTime);
      const rate = v.parkingRatePerHour || 0;

      const total = horas * rate;

      map.set(mes, (map.get(mes) || 0) + total);
    });

    return Array.from(map.entries()).map(([mes, total]) => ({
      mes,
      total,
    }));
  }, [visits]);

  const estadoPagosParking = useMemo(() => {
    const map = new Map<string, number>();

    visits.forEach((v) => {
      if (!v.hasParking) return;

      const estado = v.paymentStatus || "NONE";

      map.set(estado, (map.get(estado) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [visits]);

  const ingresosParking = useMemo(() => {
    return visits
      .filter((v) => v.hasParking && v.paymentStatus === "APPROVED")
      .reduce((total, v) => {
        const horas = calcularHoras(v.entryTime, v.exitTime);
        const rate = v.parkingRatePerHour || 0;

        return total + horas * rate;
      }, 0);
  }, [visits]);

  const ingresosTotales = totalIngresos + ingresosParking;

  return (
    <main className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {alerta && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg font-semibold">
          ⚠️ {alerta}
        </div>
      )}

      {/* FILTROS */}
      <section className="bg-white flex border rounded-xl p-4 gap-3">
        <input type="date" onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" onChange={(e) => setFechaFin(e.target.value)} />
        <select
          className="border rounded p-2"
          onChange={(e) =>
            setMesSeleccionado(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
        >
          <option value="all">Todos los meses</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(2024, i).toLocaleString("es-CO", { month: "long" })}
            </option>
          ))}
        </select>
      </section>

      {/* KPIs */}
      <section className="grid md:grid-cols-2 xl:grid-cols-8 gap-4">
        {/* INGRESOS */}
        <KPI
          titulo="Ingresos cuotas"
          valor={totalIngresos}
          tool="Dinero pagado por los residentes en cuotas de administración."
          verde
        />

        <KPI
          titulo="Ingresos parqueadero"
          valor={ingresosParking}
          tool="Dinero generado por el uso del parqueadero por visitantes."
          verde
        />

        <KPI
          titulo="Ingresos totales"
          valor={ingresosTotales}
          tool="Suma total de ingresos de cuotas y parqueadero."
          azul
        />

        {/* ESTADO FINANCIERO */}

        <KPI
          titulo="Gastos"
          valor={totalGastos}
          tool="Todo lo que se ha gastado en la copropiedad."
          rojo
        />

        <KPI
          titulo="Balance"
          valor={balanceTotal}
          tool="Diferencia entre ingresos totales y gastos."
          verde={balanceTotal > 0}
          rojo={balanceTotal < 0}
        />

        {/* COBRANZA */}

        <KPI
          titulo="Deuda residentes"
          valor={totalDeuda}
          tool="Dinero que los residentes aún deben pagar."
          rojo
        />

        <KPI
          titulo="Cumplimiento"
          valor={cumplimientoReal}
          isPercent
          tool="Porcentaje de cuotas pagadas frente a lo que se debía cobrar."
          warning={cumplimientoReal < 80}
        />

        {/* OPERACIÓN */}

        <KPI
          titulo="Visitas parqueadero"
          valor={visits.length}
          tool="Cantidad total de visitas registradas."
          azul
          isMoney={false}
        />
      </section>

      {/* GRÁFICAS */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480,
        }}
        cols={{
          lg: 12,
          md: 12,
          sm: 6,
          xs: 2,
        }}
        rowHeight={100}
        compactType="vertical"
        preventCollision={false}
      >
        <div key="saldo">
          <ChartCard titulo="Saldo acumulado">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finanzas}>
                <XAxis dataKey="mes" tickFormatter={formatMes} />
                <YAxis />
                <Tooltip />
                <Area dataKey="flujo" stroke="#2563eb" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div key="ingresos">
          <ChartCard titulo="Ingresos vs gastos">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={finanzas}>
                <XAxis dataKey="mes" tickFormatter={formatMes} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="ingresos" stroke="#10b981" />
                <Line dataKey="gastos" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="deudores">
          <ChartCard titulo="Top deudores">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDeudores}>
                <XAxis dataKey="nombre" />
                <YAxis />

                <Tooltip
                  formatter={(v: number) => formatMoney(v)}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;

                    return `${label} • ${item?.meses}`;
                  }}
                />

                <Bar dataKey="deuda" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="tipos">
          <ChartCard titulo="Tipos de cuotas">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tiposCuotas} dataKey="value" nameKey="name">
                  {tiposCuotas.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="mes">
          <ChartCard titulo="Configuración por mes">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={configuracionPorMes}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Bar dataKey="valor" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="torre">
          <ChartCard titulo="Morosidad por torre">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deudaPorTorre}>
                <XAxis dataKey="torre" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Bar dataKey="deuda" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="gastos">
          {" "}
          <ChartCard titulo="Gastos por categoría">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gastosPorCategoria} dataKey="value" nameKey="name">
                  {gastosPorCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="cuotas">
          <ChartCard titulo="Estado de cuotas">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estadoCuotas} dataKey="value" nameKey="name">
                  {estadoCuotas.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div key="parkingIngresos">
          <ChartCard titulo="Ingresos parqueadero por mes">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ingresosParkingMes}>
                <XAxis dataKey="mes" tickFormatter={formatMes} />
                <YAxis />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="parqueo">
          {" "}
          <ChartCard titulo="Uso de parqueadero">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usoParking} dataKey="value" nameKey="name">
                  {usoParking.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div key="estadoparqueo">
          {" "}
          <ChartCard titulo="Estado pagos parqueadero">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estadoPagosParking} dataKey="value" nameKey="name">
                  {estadoPagosParking.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </ResponsiveGridLayout>
    </main>
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
}) {
  const color = warning
    ? "text-yellow-500"
    : verde
      ? "text-green-600"
      : rojo
        ? "text-red-600"
        : azul
          ? "text-blue-600"
          : "";

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Text size="xs">{titulo}</Text>

        {tool && (
          <Toolt
            content={tool}
            position="bottom"
            className="bg-gray-400 font-semibold text-white text-sm p-2 rounded w-64"
          >
            <FaCircleInfo className="text-gray-400 cursor-pointer" />
          </Toolt>
        )}
      </div>

      <div className={`text-2xl font-bold ${color}`}>
        {isPercent
          ? `${valor.toFixed(1)}%`
          : isMoney
            ? formatMoney(valor)
            : valor.toLocaleString("es-CO")}
      </div>
    </div>
  );
}
function ChartCard({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 h-full w-full overflow-hidden">
      <Text font="bold">{titulo}</Text>

      <div className="w-full h-[90%]">{children}</div>
    </div>
  );
}
