"use client";

import { Buton, InputField, Table, Tooltip } from "complexes-next-components";
import React, { useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import { useMutationRemoveUser } from "./use-remive-mutation";
import {
  // MdDeleteForever,
  MdFilterAltOff,
  MdTransferWithinAStation,
} from "react-icons/md";
import { FaFileInvoice, FaMoneyBillTrendUp } from "react-icons/fa6";
import { BsFillPersonVcardFill } from "react-icons/bs";
import ModalInfo from "./modal/modal-info";
import ModalRemove from "./modal/modal-remove";
import ModalPay from "./modal/modal-pago";
import ModalCertification from "./modal/modal-certification";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { useUsersQuery } from "./use-users-query";
import ModalTransfer from "./modal/ModalTransfer";
import ModalMulta from "./modal/modal-multa";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [filterName, setFilterName] = useState("");
  const [filterApartment, setFilterApartment] = useState("");
  const [filterDebt, setFilterDebt] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [openTransfer, setOpenTransfer] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalMulta, setOpenModalMulta] = useState(false);

  const [openModalCertification, setOpenModalCertification] = useState(false);

  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading, error } = useUsersQuery(page, limit);
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

  const hasNotified = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => f.status === "NOTIFIED");

  const getRowCellClasses = (user: EnsembleResponse): string[] => {
    const pending = hasPending(user);
    const notified = hasNotified(user);
    if (pending && notified)
      return Array(6)
        .fill(null)
        .map((_, i) => (i % 2 === 0 ? "bg-yellow-100" : "bg-pink-100"));
    if (pending) return Array(6).fill("bg-yellow-100");
    if (notified) return Array(6).fill("bg-pink-100");
    return Array(6).fill("bg-white");
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  const filtered = data?.data?.filter((user) => {
    const fullName = `${user?.user?.name || ""} ${
      user?.user?.lastName || ""
    }`.toLowerCase();

    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "pending" && hasPending(user)) ||
      (filterStatus === "notified" && hasNotified(user)) ||
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

  const cellClasses = filtered?.map((user) => getRowCellClasses(user));

  const rows = filtered?.map((user) => {
    const isEmployee = user.role === "employee";

    return [
      <div key={`name-${user.id}`}>
        {user?.user?.name} {user?.user?.lastName}
        {hasPending(user) && (
          <span className="ml-2 text-xs text-yellow-700 font-bold">⏳</span>
        )}
        {hasNotified(user) && (
          <span className="ml-2 text-xs text-pink-700 font-bold">📄</span>
        )}
      </div>,

      <div key={`tower-${user.id}`}>{user?.tower}</div>,

      <div key={`apto-${user.id}`}>{user?.apartment}</div>,

      <div key={`reside-${user.id}`}>
        {user?.isMainResidence ? "Sí" : "No"}
      </div>,

      <div key={`vehicles-${user.id}`}>
        {user.vehicles?.length
          ? user.vehicles.map((v) => v.plaque).join(", ")
          : "Sin vehículo"}
      </div>,

      <div key={`actions-${user.id}`} className="flex gap-3 justify-center">
        <Tooltip
          content="Resumen del usuario"
          className="bg-gray-200"
          position="left"
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
        </Tooltip>

        <Tooltip
          content="Asignar Multa"
          className="bg-gray-200"
          position="left"
        >
          <Buton
            size="sm"
            borderWidth="none"
            disabled={isEmployee}
            onClick={() => {
              setSelectedUser(user);
              setOpenModalMulta(true);
            }}
          >
            <HiOutlineDocumentText color="#f59e0b" />
          </Buton>
        </Tooltip>

        <Tooltip
          content="Registrar Pago "
          className="bg-gray-200"
          position="left"
        >
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
        </Tooltip>

        <Tooltip
          content="Asignar certificaciones "
          className="bg-gray-200"
          position="left"
        >
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
        </Tooltip>

        <Tooltip
          content="Transferencia de propiedad"
          className="bg-gray-200"
          position="left"
        >
          <Buton
            size="sm"
            borderWidth="none"
            disabled={isEmployee}
            onClick={() => {
              setSelectedUser(user);
              setOpenTransfer(true);
            }}
          >
            <MdTransferWithinAStation color="#f59e0b" />
          </Buton>
        </Tooltip>
      </div>,
    ];
  });

  return (
    <div className="space-y-2 p-2" key={language}>
      <div className="bg-white p-2 rounded-xl shadow flex flex-wrap gap-1 items-center">
        <div className="flex gap-2">
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
        </div>

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

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => setFilterStatus("pending")}
          >
            <span className="w-4 h-4 rounded bg-yellow-100 border"></span>
            <span>Deuda pendiente de pago</span>
          </div>

          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => setFilterStatus("notified")}
          >
            <span className="w-4 h-4 rounded bg-pink-100 border"></span>
            <span>Multa notificada</span>
          </div>
        </div>
        <div
          className="cursor-pointer p-2 rounded hover:bg-gray-100"
          onClick={() => setFilterStatus("")}
          title="Quitar filtros"
        >
          <MdFilterAltOff size={20} />
        </div>
      </div>

      <div>
        <Table
          headers={[
            "Nombre",
            "Torre",
            "Apto",
            "Reside",
            "Vehículos",
            "Acciones",
          ]}
          font="bold"
          rows={rows}
          cellClasses={cellClasses}
          serverPagination
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
          rowsPerPage={limit}
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

      <ModalMulta
        isOpen={openModalMulta}
        onClose={() => setOpenModalMulta(false)}
        selectedUser={selectedUser}
      />

      <ModalCertification
        isOpen={openModalCertification}
        onClose={() => setOpenModalCertification(false)}
        selectedUser={selectedUser}
      />

      <ModalTransfer
        isOpen={openTransfer}
        onClose={() => setOpenTransfer(false)}
        // selectedUser={selectedUser}
      />
    </div>
  );
}
