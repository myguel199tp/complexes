/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState } from "react";
import { Text } from "complexes-next-components";
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
  AreaChart,
  Area,
} from "recharts";

interface Usuario {
  id: string;
  name: string;
  lastName?: string;
}

interface Cuota {
  amount: string;
  type?: string;
  dueDate?: string;
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

interface Props {
  data?: Residente[];
  expenses?: Gasto[];
}

interface MesData {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  flujo: number;
}

const COLORES = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const formatMoney = (value: number) => `$${value.toLocaleString("es-CO")}`;

const formatMes = (mes: string) => {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
};

export default function DashboardUltra({ data = [], expenses = [] }: Props) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const enRango = (fecha?: string) => {
    if (!fecha) return true;

    const f = new Date(fecha);

    if (fechaInicio && f < new Date(fechaInicio)) return false;
    if (fechaFin && f > new Date(fechaFin)) return false;

    return true;
  };

  const parseMonto = (m?: string) => {
    const n = Number(m?.replace(",", ""));
    return Number.isFinite(n) ? n : 0;
  };

  const residentes = data;

  const cuotas = useMemo(() => {
    const arr: Cuota[] = [];

    residentes.forEach((r) =>
      r.adminFees?.forEach((f) => {
        if (enRango(f.dueDate)) arr.push(f);
      }),
    );

    return arr;
  }, [residentes, fechaInicio, fechaFin]);

  const gastosFiltrados = useMemo(() => {
    return expenses.filter((g) => enRango(g.paymentDate));
  }, [expenses, fechaInicio, fechaFin]);

  const totalIngresos = cuotas.reduce((s, f) => s + parseMonto(f.amount), 0);
  const totalGastos = gastosFiltrados.reduce(
    (s, g) => s + parseMonto(g.amount),
    0,
  );

  const balanceTotal = totalIngresos - totalGastos;

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
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map((m) => {
        const balance = m.ingresos - m.gastos;
        flujo += balance;
        return { ...m, balance, flujo };
      });
  }, [cuotas, gastosFiltrados]);

  const deudaTorre = useMemo(() => {
    const map = new Map<string, number>();

    residentes.forEach((r) => {
      const deuda =
        r.adminFees
          ?.filter((f) => f.dueDate && new Date(f.dueDate) < new Date())
          .reduce((s, f) => s + parseMonto(f.amount), 0) || 0;

      const t = r.tower || "Sin torre";

      map.set(t, (map.get(t) || 0) + deuda);
    });

    return Array.from(map.entries()).map(([nombre, valor]) => ({
      nombre,
      valor,
    }));
  }, [residentes]);

  const gastosCategoria = useMemo(() => {
    const map = new Map<string, number>();

    gastosFiltrados.forEach((g) => {
      const cat = g.category?.name || "Otros";
      map.set(cat, (map.get(cat) || 0) + parseMonto(g.amount));
    });

    return Array.from(map.entries()).map(([categoria, monto]) => ({
      categoria,
      monto,
    }));
  }, [gastosFiltrados]);

  return (
    <main className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <section className="bg-white flex border rounded-xl p-4 gap-3">
        <div className="flex flex-col">
          <Text size="xs">Fecha inicio</Text>
          <input
            type="date"
            className="border rounded p-2"
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <Text size="xs">Fecha fin</Text>
          <input
            type="date"
            className="border rounded p-2"
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <KPI titulo="Ingresos" valor={totalIngresos} verde />
        <KPI titulo="Gastos" valor={totalGastos} rojo />
        <KPI titulo="Balance" valor={balanceTotal} azul />
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard titulo="Saldo acumulado">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={finanzas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={formatMes} />
              <YAxis />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Area dataKey="flujo" stroke="#2563eb" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Balance mensual">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finanzas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={formatMes} />
              <YAxis />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="balance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Ingresos vs gastos">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={finanzas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={formatMes} />
              <YAxis />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
              <Line dataKey="ingresos" stroke="#10b981" />
              <Line dataKey="gastos" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Recaudo mensual">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={finanzas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={formatMes} />
              <YAxis />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Area dataKey="ingresos" stroke="#16a34a" fill="#bbf7d0" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Distribución de gastos">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={gastosCategoria} dataKey="monto" nameKey="categoria">
                {gastosCategoria.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Deuda por torre">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deudaTorre}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="valor" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </main>
  );
}

function KPI({
  titulo,
  valor,
  verde,
  rojo,
  azul,
}: {
  titulo: string;
  valor: number;
  verde?: boolean;
  rojo?: boolean;
  azul?: boolean;
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <Text size="xs" className="text-gray-500">
        {titulo}
      </Text>
      <div
        className={`text-2xl font-bold ${
          verde
            ? "text-green-600"
            : rojo
              ? "text-red-600"
              : azul
                ? "text-blue-600"
                : ""
        }`}
      >
        {formatMoney(valor)}
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
    <div className="bg-white border rounded-xl p-4 h-[340px]">
      <Text font="bold">{titulo}</Text>
      <div className="h-[85%]">{children}</div>
    </div>
  );
}
