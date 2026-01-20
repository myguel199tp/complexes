"use client";

import {
  Badge,
  Buton,
  InputField,
  Table,
  Text,
  Tooltip,
} from "complexes-next-components";
import React, { useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { allUserService } from "../services/usersService";
import { useMutationRemoveUser } from "./use-remive-mutation";
import { MdDeleteForever } from "react-icons/md";
import { FaFileInvoice, FaMoneyBillTrendUp } from "react-icons/fa6";
import { BsFillPersonVcardFill } from "react-icons/bs";
import ModalInfo from "./modal/modal-info";
import ModalRemove from "./modal/modal-remove";
import ModalPay from "./modal/modal-pago";
import ConjuntoDashboard from "./modal/ConjuntoDashboard";
import ModalCertification from "./modal/modal-certification";
import { IoSearchCircle } from "react-icons/io5";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function TablesRent() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const [filterText, setFilterText] = useState("");
  const [filterMora, setFilterMora] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalCertification, setOpenModalCertification] = useState(false);

  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null,
  );

  const { t } = useTranslation();
  const { language } = useLanguage();

  const {
    data = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["users", infoConjunto],
    queryFn: () => allUserService(infoConjunto),
    enabled: !!infoConjunto,
  });

  const removeUserMutation = useMutationRemoveUser(infoConjunto);

  const handleDelete = (userId: string) => {
    removeUserMutation.mutate(userId, {
      onSuccess: () => setOpenModal(false),
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  const headers = [
    t("nombre"),
    t("apellido"),
    t("torre"),
    t("numeroInmuebleResidencial"),
    t("habita"),
    t("numeroPlaca"),
    t("acciones"),
  ];

  /* ===========================
     🔹 FILTRO BASE SOLO OWNERS
     =========================== */
  const ownersOnly = data.filter((user) => user.role === "tenant");

  const { rows, cellClasses } = ownersOnly
    .filter((user) => {
      const filterLower = filterText.toLowerCase();

      const vehicleString = user.vehicles?.length
        ? user.vehicles
            .map((v) => `${v.assignmentNumber} - ${v.plaque}`)
            .join(", ")
            .toLowerCase()
        : "";

      const matchesText =
        user.user.name?.toLowerCase().includes(filterLower) ||
        user.user.lastName?.toLowerCase().includes(filterLower) ||
        user.tower?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        vehicleString.includes(filterLower);

      const matchesHabita =
        filterMora === "" ||
        (filterMora === "si" && user.isMainResidence) ||
        (filterMora === "no" && !user.isMainResidence);

      return matchesText && matchesHabita;
    })
    .reduce(
      (acc, user) => {
        const vehiclesText = user.vehicles?.length
          ? user.vehicles
              .map((v) => `${v.assignmentNumber} - ${v.plaque}`)
              .join(", ")
          : t("sinVehiculo");

        acc.rows.push([
          user.user.name,
          user.user.lastName,
          user.tower,
          user.apartment,
          user.isMainResidence ? t("recidesi") : t("recideno"),
          vehiclesText,
          <div className="flex gap-4 justify-center" key={user.id}>
            {/* ELIMINAR */}
            <Tooltip content="Eliminar" className="bg-gray-200">
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                onClick={() => {
                  setSelectedUser(user);
                  setOpenModal(true);
                }}
              >
                <MdDeleteForever color="red" size={20} />
              </Buton>
            </Tooltip>

            {/* INFO */}
            <Tooltip content="Información completa" className="bg-gray-200">
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                onClick={() => {
                  setSelectedUser(user);
                  setOpenModalInfo(true);
                }}
              >
                <BsFillPersonVcardFill color="blue" size={20} />
              </Buton>
            </Tooltip>

            {/* PAGOS */}
            <Tooltip content="Pagos" className="bg-gray-200">
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                onClick={() => {
                  setSelectedUser(user);
                  setOpenModalPay(true);
                }}
              >
                <FaMoneyBillTrendUp color="green" size={20} />
              </Buton>
            </Tooltip>

            {/* CERTIFICADOS */}
            <Tooltip content="Certificaciones" className="bg-gray-200">
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                onClick={() => {
                  setSelectedUser(user);
                  setOpenModalCertification(true);
                }}
              >
                <FaFileInvoice size={20} />
              </Buton>
            </Tooltip>
          </div>,
        ]);

        acc.cellClasses.push(headers.map(() => "bg-white"));
        return acc;
      },
      { rows: [] as React.ReactNode[][], cellClasses: [] as string[][] },
    );

  return (
    <div key={language} className="w-full p-4">
      <Badge background="primary" rounded="lg" size="xs">
        {t("usuariosRegistrados")}: <Text font="bold">{rows.length}</Text>
      </Badge>

      <div className="flex gap-4 mt-4">
        <InputField
          placeholder={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <select
        value={filterMora}
        onChange={(e) => setFilterMora(e.target.value)}
        className="border rounded-md px-3 py-2 mt-2"
      >
        <option value="">{t("habita")}</option>
        <option value="si">{t("recidesi")}</option>
        <option value="no">{t("recideno")}</option>
      </select>

      <Table
        headers={headers}
        rows={rows}
        cellClasses={cellClasses}
        columnWidths={["10%", "10%", "10%", "10%", "10%", "10%", "20%"]}
      />

      <ModalRemove
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        selectedUser={selectedUser}
        onDelete={handleDelete}
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

      <ConjuntoDashboard data={ownersOnly} />
    </div>
  );
}
