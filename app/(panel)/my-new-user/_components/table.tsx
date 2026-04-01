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

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [filterName, setFilterName] = useState("");
  const [filterApartment, setFilterApartment] = useState("");
  const [filterDebt, setFilterDebt] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  // helpers
  const hasDebt = (user: EnsembleResponse) =>
    user.adminFees && user.adminFees.length > 0;

  const hasPending = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => f.status === "PENDING");

  const hasApproved = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => f.status === "APPROVED");

  const hasRejected = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => f.status === "REJECTED");

  const getRowColor = (user: EnsembleResponse) => {
    if (hasPending(user)) return "bg-yellow-100";
    return "";
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  const filtered = data?.filter((user) => {
    const fullName = `${user?.user?.name || ""} ${
      user?.user?.lastName || ""
    }`.toLowerCase();

    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "pending" && hasPending(user)) ||
      (filterStatus === "approved" && hasApproved(user)) ||
      (filterStatus === "rejected" && hasRejected(user));

    return (
      fullName.includes(filterName.toLowerCase()) &&
      user?.apartment?.toLowerCase().includes(filterApartment.toLowerCase()) &&
      (filterDebt === "" ||
        (filterDebt === "con" && hasDebt(user)) ||
        (filterDebt === "sin" && !hasDebt(user))) &&
      matchesStatus
    );
  });

  const rows = filtered.map((user) => {
    const isEmployee = user.role === "employee";
    const rowColor = getRowColor(user);

    return [
      <div key={`name-${user.id}`} className={rowColor}>
        {user?.user?.name} {user?.user?.lastName}
        {hasPending(user) && (
          <span className="ml-2 text-xs text-yellow-700 font-bold">⏳</span>
        )}
      </div>,

      <div key={`tower-${user.id}`} className={rowColor}>
        {user?.tower}
      </div>,

      <div key={`apto-${user.id}`} className={rowColor}>
        {user?.apartment}
      </div>,

      <div key={`reside-${user.id}`} className={rowColor}>
        {user?.isMainResidence ? "Sí" : "No"}
      </div>,

      <div key={`vehicles-${user.id}`} className={rowColor}>
        {user.vehicles?.length
          ? user.vehicles.map((v) => v.plaque).join(", ")
          : "Sin vehículo"}
      </div>,

      <div
        key={`actions-${user.id}`}
        className={`flex gap-3 justify-center ${rowColor}`}
      >
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Estado pagos</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>

        <Badge background="primary">Usuarios: {filtered.length}</Badge>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <Table
          headers={[
            "Nombre",
            "Torre",
            "Apto",
            "Reside",
            "Vehículos",
            "Acciones",
          ]}
          rows={rows}
        />
      </div>

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
