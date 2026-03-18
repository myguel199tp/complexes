"use client";

import { Badge, Buton, InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import { useMutationRemoveUser } from "./use-remive-mutation";
import { MdDeleteForever } from "react-icons/md";
import { FaFileInvoice, FaMoneyBillTrendUp } from "react-icons/fa6";
import { BsFillPersonVcardFill } from "react-icons/bs";
import ModalInfo from "./modal/modal-info";
import ModalRemove from "./modal/modal-remove";
import ModalPay from "./modal/modal-pago";
import ModalCertification from "./modal/modal-certification";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { useUsersQuery } from "./use-users-query";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from "recharts";

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [filterName, setFilterName] = useState("");
  const [filterApartment, setFilterApartment] = useState("");
  const [filterDebt, setFilterDebt] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalCertification, setOpenModalCertification] = useState(false);

  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null,
  );

  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data = [], isLoading, error } = useUsersQuery();
  const removeUserMutation = useMutationRemoveUser(infoConjunto);

  const hasDebt = (user: EnsembleResponse) =>
    user.adminFees && user.adminFees.length > 0;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  // 📊 STATS
  const stats = {
    total: data.length,
    residents: data.filter((u) => u.role === "owner").length,
    employees: data.filter((u) => u.role === "employee").length,
    debt: data.filter((u) => hasDebt(u)).length,
  };

  // 📊 DATA GRAFICOS
  const roleData = [
    { name: "Residentes", value: stats.residents },
    { name: "Empleados", value: stats.employees },
  ];

  const debtData = [
    { name: "Con deuda", value: stats.debt },
    { name: "Al día", value: stats.total - stats.debt },
  ];

  const COLORS = ["#2563eb", "#10b981"];
  const DEBT_COLORS = ["#ef4444", "#22c55e"];

  const headers = [
    "Nombre",
    "Torre",
    "Apto",
    "Reside",
    "Vehículos",
    "Acciones",
  ];

  const filtered = data.filter((user) => {
    const fullName = `${user?.user?.name || ""} ${
      user?.user?.lastName || ""
    }`.toLowerCase();

    return (
      fullName.includes(filterName.toLowerCase()) &&
      user?.apartment?.toLowerCase().includes(filterApartment.toLowerCase()) &&
      (filterDebt === "" ||
        (filterDebt === "con" && hasDebt(user)) ||
        (filterDebt === "sin" && !hasDebt(user)))
    );
  });

  const rows = filtered.map((user) => {
    const isEmployee = user.role === "employee";

    return [
      `${user?.user?.name || ""} ${user?.user?.lastName || ""}`,
      user?.tower,
      user?.apartment,
      user?.isMainResidence ? "Sí" : "No",
      user.vehicles?.length
        ? user.vehicles.map((v) => v.plaque).join(", ")
        : "Sin vehículo",
      <div className="flex gap-3 justify-center" key={user.id}>
        <Buton
          size="sm"
          borderWidth="none"
          onClick={() => {
            setSelectedUser(user);
            setOpenModalInfo(true);
          }}
        >
          <BsFillPersonVcardFill color="#2563eb" />
        </Buton>

        <Buton
          size="sm"
          borderWidth="none"
          disabled={isEmployee}
          onClick={() => {
            setSelectedUser(user);
            setOpenModalPay(true);
          }}
        >
          <FaMoneyBillTrendUp color="#16a34a" />
        </Buton>

        <Buton
          size="sm"
          borderWidth="none"
          disabled={isEmployee}
          onClick={() => {
            setSelectedUser(user);
            setOpenModalCertification(true);
          }}
        >
          <FaFileInvoice />
        </Buton>

        <Buton
          size="sm"
          borderWidth="none"
          disabled={isEmployee}
          onClick={() => {
            setSelectedUser(user);
            setOpenModal(true);
          }}
        >
          <MdDeleteForever color="red" />
        </Buton>
      </div>,
    ];
  });

  return (
    <div className="space-y-6 p-4" key={language}>
      {/* 🔥 KPI CARDS */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <p>Total</p>
          <h2 className="text-2xl font-bold">{stats.total}</h2>
        </div>
        <div className="bg-blue-50 shadow rounded-xl p-4">
          <p>Residentes</p>
          <h2 className="text-2xl font-bold">{stats.residents}</h2>
        </div>
        <div className="bg-green-50 shadow rounded-xl p-4">
          <p>Al día</p>
          <h2 className="text-2xl font-bold">{stats.total - stats.debt}</h2>
        </div>
        <div className="bg-red-50 shadow rounded-xl p-4">
          <p>Con deuda</p>
          <h2 className="text-2xl font-bold">{stats.debt}</h2>
        </div>
      </div>

      {/* 🔍 FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3">
        <InputField
          placeholder="Buscar por nombre"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        <InputField
          placeholder="Buscar por apartamento"
          value={filterApartment}
          onChange={(e) => setFilterApartment(e.target.value)}
        />

        <select
          value={filterDebt}
          onChange={(e) => setFilterDebt(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Deuda</option>
          <option value="con">Con deuda</option>
          <option value="sin">Al día</option>
        </select>

        <Badge background="primary">Usuarios: {filtered.length}</Badge>
      </div>

      {/* 📋 TABLA */}
      <div className="bg-white p-4 rounded-xl shadow">
        <Table headers={headers} rows={rows} />
      </div>

      {/* 📊 GRAFICOS */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-semibold">Usuarios</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={roleData} dataKey="value">
                {roleData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-semibold">Estado de pagos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={debtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="value">
                {debtData.map((_, i) => (
                  <Cell key={i} fill={DEBT_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODALES */}
      <ModalRemove
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        selectedUser={selectedUser}
        onDelete={(id) => removeUserMutation.mutate(id)}
      />

      <ModalInfo
        isOpen={openModalInfo}
        onClose={() => setOpenModalInfo(false)}
        selectedUser={selectedUser}
      />

      <ModalPay
        isOpen={openModalPay}
        onClose={() => setOpenModalPay(false)}
        selectedUser={selectedUser}
      />

      <ModalCertification
        isOpen={openModalCertification}
        onClose={() => setOpenModalCertification(false)}
        selectedUser={selectedUser}
      />
    </div>
  );
}
