"use client";

import { Buton, InputField, Table, Tooltip } from "complexes-next-components";
import React, { useEffect, useState } from "react";
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
import { isStaffRole } from "./constants";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import type {
  DebtFilter,
  FeeStatusFilter,
} from "../services/usersService";
import {
  isDebtFee,
  isOverdueFee,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";

/** Todos los filtros se resuelven en el backend, sobre todas las páginas */
interface Filters {
  search: string;
  debt: DebtFilter;
  status: FeeStatusFilter;
}

const INITIAL_FILTERS: Filters = {
  search: "",
  debt: "",
  status: "",
};

type ModalType =
  | "info"
  | "multa"
  | "pay"
  | "certification"
  | "transfer"
  | "remove";

interface ModalState {
  type: ModalType | null;
  user: EnsembleResponse | null;
}

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  /** Los atajos de color funcionan como interruptor: vuelven a clic apagarse */
  const toggleStatus = (status: FeeStatusFilter) =>
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
    }));

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const [modal, setModal] = useState<ModalState>({
    type: null,
    user: null,
  });

  const openModal = (type: ModalType, user: EnsembleResponse | null = null) =>
    setModal({ type, user });

  const closeModal = () => setModal((prev) => ({ ...prev, type: null }));

  const selectedUser = modal.user;

  const [page, setPage] = useState(1);
  const limit = 10;

  const { t } = useTranslation();
  const { language } = useLanguage();

  // Los filtros se resuelven en el backend sobre todas las páginas. El texto
  // va con debounce; cualquier cambio de filtro vuelve a la primera página.
  const debouncedSearch = useDebouncedValue(filters.search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.debt, filters.status]);

  const { data, isLoading, isFetching, error } = useUsersQuery(page, limit, {
    search: debouncedSearch,
    debt: filters.debt,
    status: filters.status,
  });
  const removeUserMutation = useMutationRemoveUser(infoConjunto);

  /*
    Helpers solo para el resaltado visual de las filas.

    Miraban `PENDING` y `NOTIFIED` a secas, así que la unidad realmente
    morosa —que el cron de medianoche ya pasó a `OVERDUE`— salía en blanco,
    igual que una unidad al día. Ahora se resalta cualquier deuda viva y se
    reserva el color fuerte para lo vencido.
  */
  const hasDebt = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => isDebtFee(f.status));

  /*
    Vencida es fecha pasada, no solo el estado `OVERDUE`: entre que la cuota
    se vence y corre el cron de medianoche que la marca, la fila se seguía
    viendo al día.
  */
  const hasOverdue = (user: EnsembleResponse) =>
    user.adminFees?.some((f) => isOverdueFee(f));

  const getRowCellClasses = (user: EnsembleResponse): string[] => {
    if (hasOverdue(user)) return Array(6).fill("bg-pink-100");
    if (hasDebt(user)) return Array(6).fill("bg-yellow-100");
    return Array(6).fill("bg-white");
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  // Ya viene filtrado y paginado desde el backend.
  const visibleUsers = data?.data ?? [];

  const cellClasses = visibleUsers.map((user) => getRowCellClasses(user));

  const rows = visibleUsers.map((user) => {
    const isStaff = isStaffRole(user.role);

    return [
      <div key={`name-${user.id}`}>
        {user?.user?.name} {user?.user?.lastName}
        {hasOverdue(user) ? (
          <span className="ml-2 text-xs text-pink-700 font-bold">📄</span>
        ) : hasDebt(user) ? (
          <span className="ml-2 text-xs text-yellow-700 font-bold">⏳</span>
        ) : null}
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
            onClick={() => openModal("info", user)}
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
            disabled={isStaff}
            onClick={() => openModal("multa", user)}
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
            disabled={isStaff}
            onClick={() => openModal("pay", user)}
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
            disabled={isStaff}
            onClick={() => openModal("certification", user)}
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
            disabled={isStaff}
            onClick={() => openModal("transfer", user)}
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
        <div className="flex items-center gap-2 min-w-[320px]">
          <InputField
            className="w-full"
            placeholder="Buscar por nombre, apto, torre, cédula, correo o placa"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />

          {isFetching && (
            <ImSpinner9 className="animate-spin text-cyan-800" size={18} />
          )}
        </div>

        <select
          value={filters.debt}
          onChange={(e) => setFilter("debt", e.target.value as Filters["debt"])}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Deuda</option>
          <option value="con">Con deuda</option>
          <option value="sin">Al día</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilter("status", e.target.value as Filters["status"])
          }
          className="border rounded-md px-3 py-2"
        >
          <option value="">Estado pagos</option>
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobados</option>
          <option value="REJECTED">Rechazados</option>
          <option value="NOTIFIED">Multas notificadas</option>
        </select>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div
            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
              filters.status === "PENDING" ? "bg-gray-100 ring-1 ring-cyan-700" : ""
            }`}
            onClick={() => toggleStatus("PENDING")}
          >
            <span className="w-4 h-4 rounded bg-yellow-100 border"></span>
            <span>Deuda pendiente de pago</span>
          </div>

          <div
            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
              filters.status === "NOTIFIED" ? "bg-gray-100 ring-1 ring-cyan-700" : ""
            }`}
            onClick={() => toggleStatus("NOTIFIED")}
          >
            <span className="w-4 h-4 rounded bg-pink-100 border"></span>
            <span>Multa notificada</span>
          </div>
        </div>
        <div
          className="cursor-pointer p-2 rounded hover:bg-gray-100"
          onClick={clearFilters}
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
        isOpen={modal.type === "remove"}
        onClose={closeModal}
        selectedUser={selectedUser}
        onDelete={(id) => removeUserMutation.mutate(id)}
      />

      <ModalInfo
        isOpen={modal.type === "info"}
        onClose={closeModal}
        selectedUser={selectedUser}
      />

      <ModalPay
        isOpen={modal.type === "pay"}
        onClose={closeModal}
        selectedUser={selectedUser}
      />

      <ModalMulta
        isOpen={modal.type === "multa"}
        onClose={closeModal}
        selectedUser={selectedUser}
      />

      <ModalCertification
        isOpen={modal.type === "certification"}
        onClose={closeModal}
        selectedUser={selectedUser}
      />

      <ModalTransfer
        isOpen={modal.type === "transfer"}
        onClose={closeModal}
        selectedUser={selectedUser}
      />
    </div>
  );
}
