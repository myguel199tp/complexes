"use client";

import { Tooltip } from "complexes-next-components";
import { Table } from "@/app/components/ui/table";
import React, { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import { useMutationRemoveUser } from "./use-remive-mutation";
import {
  // MdDeleteForever,
  MdFilterAltOff,
  MdForwardToInbox,
  MdSubdirectoryArrowRight,
  MdTransferWithinAStation,
} from "react-icons/md";
import { IoChevronForward } from "react-icons/io5";
import { useResendInvitationMutation } from "./use-resend-invitation-mutation";
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
import { HiOutlineDocumentText, HiUserGroup } from "react-icons/hi";
import { isStaffRole } from "./constants";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import type { DebtFilter, FeeStatusFilter } from "../services/usersService";
import {
  isDebtFee,
  isOverdueFee,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import { Button, InputField, SelectField } from "@/app/components/ui/form";

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

/** Quienes viajan dentro del propietario (`dependents`) y cómo se rotulan. */
const DEPENDENT_LABEL: Record<string, string> = {
  family: "Familiar",
  tenant: "Arrendatario",
};

const DEPENDENT_BADGE: Record<string, string> = {
  family: "bg-slate-200 text-slate-700",
  tenant: "bg-violet-100 text-violet-800",
};

/**
 * Celda del nombre: en móvil el valor va a la derecha de la etiqueta y en
 * escritorio centrado, como el resto de columnas.
 */
const NAME_CELL =
  "flex flex-wrap items-center justify-end gap-x-2 gap-y-1 md:justify-center";

/**
 * Barra a la izquierda de la fila de un familiar o arrendatario. Va en un
 * pseudo-elemento y no como borde para no correr el ancho de la columna.
 */
const DEPENDENT_ACCENT =
  "md:relative md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-1 md:before:bg-cyan-300";

const fullName = (user: EnsembleResponse) =>
  `${user.user?.name ?? ""} ${user.user?.lastName ?? ""}`.trim();

/** «2 familiares · arrendatario» */
const dependentsSummary = (dependents: EnsembleResponse[]) => {
  const families = dependents.filter((d) => d.role === "family").length;
  const tenants = dependents.filter((d) => d.role === "tenant").length;

  return [
    families > 0 && `${families} ${families === 1 ? "familiar" : "familiares"}`,
    tenants > 0 && (tenants === 1 ? "arrendatario" : `${tenants} arrendatarios`),
  ]
    .filter(Boolean)
    .join(" · ");
};

/** La unidad está arrendada si el propietario tiene un arrendatario vigente. */
const isRented = (user: EnsembleResponse) =>
  !!user.dependents?.some((d) => d.role === "tenant" && d.active !== false);

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

  /*
    Propietarios desplegados. Sin filtros todos empiezan cerrados y aquí van
    los que se abrieron. Con búsqueda o filtro empiezan abiertos —quien
    coincide puede ser el familiar, y si no se ve no se entiende por qué salió
    el propietario— y aquí van los que se cerraron.
  */
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const autoExpand = !!(
    debouncedSearch.trim() ||
    filters.debt ||
    filters.status
  );
  const isExpanded = (id: string) => autoExpand !== toggled.has(id);

  const toggleExpanded = (id: string) =>
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    setPage(1);
    setToggled(new Set());
  }, [debouncedSearch, filters.debt, filters.status]);

  // Agrupado: familiares y arrendatario viajan dentro de su propietario y la
  // paginación cuenta unidades, no personas.
  const { data, isLoading, isFetching, error } = useUsersQuery(page, limit, {
    search: debouncedSearch,
    debt: filters.debt,
    status: filters.status,
    groupByOwner: true,
  });
  const removeUserMutation = useMutationRemoveUser(infoConjunto);
  const resendInvitation = useResendInvitationMutation(infoConjunto);

  /*
    Sin activar = todavía no creó su contraseña con el enlace del correo, que
    dura 30 minutos. Los dados de baja también quedan con isActive en false,
    pero a esos no se les reenvía nada.
  */
  const isPendingActivation = (user: EnsembleResponse) =>
    user.user?.isActive === false && !user.user?.deactivatedAt;

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

  /*
    La deuda manda en el color, también en un familiar o arrendatario; si no
    hay deuda, la fila del dependiente va en gris claro para leerse como parte
    de la unidad de arriba.
  */
  const getRowCellClasses = (
    user: EnsembleResponse,
    isDependent: boolean,
  ): string[] => {
    const bg = hasOverdue(user)
      ? "bg-pink-100"
      : hasDebt(user)
        ? "bg-yellow-100"
        : isDependent
          ? "bg-slate-50"
          : "bg-white";

    const cells: string[] = Array(6).fill(bg);
    if (isDependent) cells[0] = `${bg} ${DEPENDENT_ACCENT}`;
    return cells;
  };

  const statusMarks = (user: EnsembleResponse) => (
    <>
      {isPendingActivation(user) && (
        <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs text-cyan-700">
          Sin activar
        </span>
      )}
      {hasOverdue(user) ? (
        <span className="text-xs text-pink-700 font-bold">📄</span>
      ) : hasDebt(user) ? (
        <span className="text-xs text-yellow-700 font-bold">⏳</span>
      ) : null}
    </>
  );

  /** Propietario (o fila suelta): con grupo, el nombre despliega el grupo. */
  const renderHeadName = (user: EnsembleResponse) => {
    const dependents = user.dependents ?? [];

    if (!dependents.length) {
      return (
        <div className={NAME_CELL}>
          <span>{fullName(user)}</span>
          {statusMarks(user)}
        </div>
      );
    }

    const expanded = isExpanded(user.id);

    // Con el grupo cerrado, la deuda de un dependiente (el arrendatario puede
    // tener cuotas a su nombre) tiene que verse en la fila del propietario.
    const groupDebtMark = dependents.some(hasOverdue)
      ? "📄"
      : dependents.some(hasDebt)
        ? "⏳"
        : null;

    return (
      <div className={NAME_CELL}>
        <button
          type="button"
          onClick={() => toggleExpanded(user.id)}
          aria-expanded={expanded}
          title={
            expanded
              ? "Ocultar familiares y arrendatario"
              : "Ver familiares y arrendatario"
          }
          className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1 rounded-md text-left transition-colors hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 md:justify-center"
        >
          <span className="inline-flex items-center gap-1.5">
            <IoChevronForward
              size={14}
              aria-hidden
              className={`shrink-0 text-cyan-600 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
            {fullName(user)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800">
            <HiUserGroup size={12} aria-hidden />
            {dependentsSummary(dependents)}
            {groupDebtMark && (
              <span title="Alguien del grupo tiene deuda">{groupDebtMark}</span>
            )}
          </span>
        </button>
        {statusMarks(user)}
      </div>
    );
  };

  /** Familiar o arrendatario, debajo de su propietario. */
  const renderDependentName = (user: EnsembleResponse) => (
    <div className={NAME_CELL}>
      <MdSubdirectoryArrowRight
        size={16}
        aria-hidden
        className="shrink-0 text-cyan-600"
      />
      <span>{fullName(user)}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          DEPENDENT_BADGE[user.role] ?? "bg-slate-200 text-slate-700"
        }`}
      >
        {DEPENDENT_LABEL[user.role] ?? user.role}
      </span>
      {statusMarks(user)}
    </div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  // Ya viene filtrado, agrupado y paginado desde el backend.
  const visibleUsers = data?.data ?? [];

  /*
    Filas de la página: cada propietario y, si está desplegado, sus
    familiares y arrendatario justo debajo. `parent` solo lo tienen ellos.
  */
  const entries: { user: EnsembleResponse; parent?: EnsembleResponse }[] =
    visibleUsers.flatMap((user) => [
      { user },
      ...(user.dependents?.length && isExpanded(user.id)
        ? user.dependents.map((dependent) => ({
            user: dependent,
            parent: user,
          }))
        : []),
    ]);

  const cellClasses = entries.map(({ user, parent }) =>
    getRowCellClasses(user, !!parent),
  );

  // En móvil cada fila es una tarjeta: la del dependiente va con sangría.
  const rowClasses = entries.map(({ parent }) =>
    parent ? "max-md:ml-6 max-md:border-dashed max-md:shadow-none" : "",
  );

  const rowKeys = entries.map(({ user }) => user.id);

  const rows = entries.map(({ user, parent }) => {
    const isStaff = isStaffRole(user.role);

    return [
      <div key={`name-${user.id}`}>
        {parent ? renderDependentName(user) : renderHeadName(user)}
      </div>,

      // Los familiares del registro inicial quedaron sin torre ni
      // apartamento: son los de la unidad de su propietario.
      <div key={`tower-${user.id}`}>{user.tower || parent?.tower}</div>,

      <div key={`apto-${user.id}`}>{user.apartment || parent?.apartment}</div>,

      <div
        key={`reside-${user.id}`}
        className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 md:justify-center"
      >
        <span>{user.isMainResidence ? "Sí" : "No"}</span>
        {!parent && isRented(user) && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
            Arrendado
          </span>
        )}
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
          <Button
            size="sm"
            variant="soft"
            onClick={() => openModal("info", user)}
          >
            <BsFillPersonVcardFill color="#2563eb" />
          </Button>
        </Tooltip>

        {isPendingActivation(user) && (
          <Tooltip
            content="Reenviar invitación"
            className="bg-gray-200"
            position="left"
          >
            <Button
              size="sm"
              variant="soft"
              disabled={resendInvitation.isPending}
              onClick={() => resendInvitation.mutate(user.id)}
            >
              <MdForwardToInbox color="#0891b2" />
            </Button>
          </Tooltip>
        )}

        <Tooltip
          content="Llamado de atención o multa"
          className="bg-gray-200"
          position="left"
        >
          <Button
            size="sm"
            variant="soft"
            disabled={isStaff}
            onClick={() => openModal("multa", user)}
          >
            <HiOutlineDocumentText color="#f59e0b" />
          </Button>
        </Tooltip>

        <Tooltip
          content="Registrar Pago "
          className="bg-gray-200"
          position="left"
        >
          <Button
            size="sm"
            variant="soft"
            disabled={isStaff}
            onClick={() => openModal("pay", user)}
          >
            <FaMoneyBillTrendUp color="#16a34a" />
          </Button>
        </Tooltip>

        <Tooltip
          content="Asignar certificaciones "
          className="bg-gray-200"
          position="left"
        >
          <Button
            size="sm"
            variant="soft"
            disabled={isStaff}
            onClick={() => openModal("certification", user)}
          >
            <FaFileInvoice />
          </Button>
        </Tooltip>

        <Tooltip
          content="Transferencia de propiedad"
          className="bg-gray-200"
          position="left"
        >
          <Button
            size="sm"
            variant="soft"
            disabled={isStaff}
            onClick={() => openModal("transfer", user)}
          >
            <MdTransferWithinAStation color="#f59e0b" />
          </Button>
        </Tooltip>
      </div>,
    ];
  });

  return (
    <div className="space-y-2 p-2" key={language}>
      {/* Barra de filtros: el buscador manda y ocupa el ancho que sobre; los
          dos selects van con ancho propio para que no se les corte la etiqueta,
          y la leyenda —que también filtra— se separa a la derecha.
          En móvil los anchos fijos dejaban tres cajitas estrechas una debajo de
          otra, así que allí cada control ocupa el ancho completo. */}
      <div className="bg-white p-3 rounded-xl shadow flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-[240px] sm:flex-1 sm:max-w-md">
            <InputField
              regexType="safeChars"
              className="w-full"
              placeholder="Buscar por nombre, apto, torre, cédula, correo o placa"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
            />

            {isFetching && (
              <ImSpinner9
                className="shrink-0 animate-spin text-cyan-800"
                size={18}
              />
            )}
          </div>

          {/* La opción vacía dice "Todas/Todos": el nombre del filtro ya lo
              pone el helpText y antes se leía dos veces. */}
          <div className="w-full sm:w-[130px] sm:shrink-0">
            <SelectField
              helpText="Deuda"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              defaultOption="Todas"
              options={[
                { value: "", label: "Todas" },
                { value: "con", label: "Con deuda" },
                { value: "sin", label: "Al día" },
              ]}
              value={filters.debt}
              onChange={(e) =>
                setFilter("debt", e.target.value as Filters["debt"])
              }
            />
          </div>

          <div className="w-full sm:w-[180px] sm:shrink-0">
            <SelectField
              helpText="Estado de pagos"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              defaultOption="Todos"
              options={[
                { value: "", label: "Todos" },
                { value: "PENDING", label: "Pendientes" },
                { value: "APPROVED", label: "Aprobados" },
                { value: "REJECTED", label: "Rechazados" },
                { value: "NOTIFIED", label: "Multas notificadas" },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilter("status", e.target.value as Filters["status"])
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            aria-pressed={filters.status === "PENDING"}
            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors hover:bg-gray-50 ${
              filters.status === "PENDING"
                ? "border-cyan-700 bg-gray-100"
                : "border-gray-200"
            }`}
            onClick={() => toggleStatus("PENDING")}
          >
            <span className="h-3.5 w-3.5 shrink-0 rounded border bg-yellow-100" />
            <span className="whitespace-nowrap">Deuda pendiente de pago</span>
          </button>

          <button
            type="button"
            aria-pressed={filters.status === "NOTIFIED"}
            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors hover:bg-gray-50 ${
              filters.status === "NOTIFIED"
                ? "border-cyan-700 bg-gray-100"
                : "border-gray-200"
            }`}
            onClick={() => toggleStatus("NOTIFIED")}
          >
            <span className="h-3.5 w-3.5 shrink-0 rounded border bg-pink-100" />
            <span className="whitespace-nowrap">Multa notificada</span>
          </button>

          <button
            type="button"
            onClick={clearFilters}
            title="Quitar filtros"
            className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <MdFilterAltOff size={18} />
            <span className="whitespace-nowrap">Limpiar</span>
          </button>
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
          rows={rows}
          cellClasses={cellClasses}
          rowClasses={rowClasses}
          rowKeys={rowKeys}
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
