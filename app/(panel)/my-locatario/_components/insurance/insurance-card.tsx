"use client";

import React, { useState } from "react";
import { Button, Text, Title } from "complexes-next-components";
import { MdOutlineShield } from "react-icons/md";

import { ContractResponse } from "../../services/response/contractResponse";
import {
  contractPolicyUrl,
  MANAGEMENT_TYPE_LABEL,
} from "../../services/contractInsuranceService";
import InsuranceModal from "./insurance-modal";

interface Props {
  contract: ContractResponse;
  /** Solo el propietario edita; el arrendatario ve a quién reclamarle. */
  canEdit: boolean;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("es-CO") : null;

export default function InsuranceCard({ contract, canEdit }: Props) {
  const [showModal, setShowModal] = useState(false);

  const managementType = contract.managementType ?? "DIRECT";
  const isDirect = managementType === "DIRECT";

  const policyUrl = contractPolicyUrl(contract.insurerPolicyFileUrl);

  const coverageEnd = contract.insurerCoverageEnd
    ? new Date(contract.insurerCoverageEnd)
    : null;

  // La póliza vencida es lo que más importa mostrar: el arrendatario sigue
  // reportando daños creyendo que hay amparo cuando ya no lo hay.
  const expired = !!coverageEnd && coverageEnd < new Date();

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 ${
        isDirect
          ? "bg-gray-50 border-gray-200"
          : "bg-purple-50 border-purple-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MdOutlineShield
            size={22}
            className={isDirect ? "text-gray-500" : "text-purple-600"}
          />

          <div>
            <Title as="h4" size="xs" font="semi">
              Administración del arriendo
            </Title>

            <Text size="xs" className="text-gray-600">
              {MANAGEMENT_TYPE_LABEL[managementType]}
            </Text>
          </div>
        </div>

        {canEdit && (
          <Button size="sm" rounded="md" onClick={() => setShowModal(true)}>
            {isDirect ? "Agregar aseguradora" : "Editar"}
          </Button>
        )}
      </div>

      {!isDirect && (
        <div className="space-y-1">
          <Text size="sm" font="semi" className="text-gray-800">
            {contract.insurerName}
          </Text>

          {contract.insurerPolicyNumber && (
            <Text size="xs" className="text-gray-600">
              Póliza {contract.insurerPolicyNumber}
            </Text>
          )}

          {(contract.insurerContactName || contract.insurerPhone) && (
            <Text size="xs" className="text-gray-600">
              {[contract.insurerContactName, contract.insurerPhone]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}

          {contract.insurerEmail && (
            <Text size="xs" className="text-gray-600">
              {contract.insurerEmail}
            </Text>
          )}

          {(contract.insurerCoverageStart || contract.insurerCoverageEnd) && (
            <Text
              size="xs"
              colVariant={expired ? "danger" : "default"}
              className={expired ? "" : "text-gray-600"}
            >
              Vigencia {formatDate(contract.insurerCoverageStart) ?? "—"} –{" "}
              {formatDate(contract.insurerCoverageEnd) ?? "—"}
              {expired ? " (vencida)" : ""}
            </Text>
          )}

          {policyUrl && (
            <a
              href={policyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline inline-block"
            >
              Ver póliza PDF
            </a>
          )}
        </div>
      )}

      {showModal && (
        <InsuranceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          contract={contract}
        />
      )}
    </div>
  );
}
