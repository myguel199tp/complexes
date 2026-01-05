"use client";

import {
  Badge,
  Buton,
  // Button,
  InputField,
  // Modal,
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
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function Tables() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [filterText, setFilterText] = useState<string>("");
  const [filterMora, setFilterMora] = useState<string>("");

  const [openModal, setOpenModal] = useState(false);
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openModalCertification, setOpenModalCertification] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnsembleResponse | null>(
    null
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
      onSuccess: () => {
        setOpenModal(false);
      },
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
    t("status"),
    t("acciones"),
  ];

  const { rows, cellClasses } = data
    .filter((user) => {
      const filterLower = filterText?.toLowerCase();
      const matchesText =
        user.user.name?.toLowerCase().includes(filterLower) ||
        user.user.lastName?.toLowerCase().includes(filterLower) ||
        user.tower?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        String(user.isMainResidence).toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower);

      const matchesHabita =
        filterMora === "" ||
        (filterMora === "si" && user.isMainResidence === true) ||
        (filterMora === "no" && user.isMainResidence === false);

      return matchesText && matchesHabita;
    })
    .reduce(
      (acc, user) => {
        const isEmployee = user.role === "employee"; // 👈 validación del rol

        acc.rows.push([
          user?.user?.lastName || "",
          user?.user?.name || "",
          user?.tower || "",
          user?.apartment || "",
          user?.isMainResidence === true ? t("recidesi") : t("recideno"),
          user?.plaque || "",
          user?.adminFees?.map((e) => e.status),
          <div className="flex gap-4 justify-center items-center" key={user.id}>
            <Tooltip
              content={isEmployee ? "Bloqueado para empleados" : "Eliminar"}
              className="bg-gray-200"
            >
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                disabled={isEmployee}
                className={isEmployee ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (isEmployee) return;
                  setSelectedUser(user);
                  setOpenModal(true);
                }}
              >
                <MdDeleteForever
                  color={isEmployee ? "gray" : "red"}
                  size={20}
                />
              </Buton>
            </Tooltip>

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

            <Tooltip
              className="bg-gray-200"
              content={isEmployee ? "Bloqueado para empleados" : "Pagos"}
            >
              <Buton
                size="sm"
                borderWidth="thin"
                rounded="lg"
                disabled={isEmployee}
                className={isEmployee ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (isEmployee) return;
                  setSelectedUser(user);
                  setOpenModalPay(true);
                }}
              >
                <FaMoneyBillTrendUp
                  color={isEmployee ? "gray" : "green"}
                  size={20}
                />
              </Buton>
            </Tooltip>
            <Tooltip className="bg-gray-200" content="Certificaciones">
              <Buton
                disabled={isEmployee}
                rounded="lg"
                size="sm"
                borderWidth="thin"
                className={isEmployee ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (isEmployee) return;
                  setSelectedUser(user);
                  setOpenModalCertification(true);
                }}
              >
                <FaFileInvoice size={20} />
              </Buton>
            </Tooltip>
          </div>,
        ]);

        const rowClass = user.adminFees.map((e) => e.status === "pending")
          ? "bg-white"
          : "bg-red-100 text-red-700";

        acc.cellClasses.push(headers.map(() => rowClass));

        return acc;
      },
      { rows: [] as React.ReactNode[][], cellClasses: [] as string[][] }
    );

  return (
    <div key={language} className="w-full p-4">
      <div className="flex gap-4">
        <Badge background="primary" rounded="lg" size="xs" role="contentinfo">
          {t("usuariosRegistrados")}:{" "}
          <Text as="span" font="bold">
            {rows.length}
          </Text>
        </Badge>
      </div>

      <div className="flex gap-4 mt-4 w-full">
        <div className="relative flex-1">
          <InputField
            placeholder={t("buscarNoticia")}
            helpText={t("buscarNoticia")}
            value={filterText}
            sizeHelp="xs"
            rounded="lg"
            inputSize="sm"
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
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
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["10%", "10%", "10%", "10%", "10%", "10%", "10%", "20%"]}
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

      <ConjuntoDashboard data={data} />
    </div>
  );
}
