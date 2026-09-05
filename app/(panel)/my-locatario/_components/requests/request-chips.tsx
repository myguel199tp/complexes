"use client";

import React from "react";
import {
  ContractRequestPriority,
  ContractRequestStatus,
  ContractRequestTarget,
  REQUEST_PRIORITY_LABEL,
  REQUEST_STATUS_LABEL,
  REQUEST_TARGET_LABEL,
} from "../../services/response/contractRequestResponse";

/**
 * Colores del estado y de la prioridad en un solo sitio.
 *
 * Se repetían en la lista, en el detalle y en la bitácora; con tres copias
 * bastaba con tocar una para que "Resuelta" saliera verde en un lado y gris en
 * otro.
 */
const STATUS_STYLE: Record<ContractRequestStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_STYLE: Record<ContractRequestPriority, string> = {
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
  MEDIUM: "bg-sky-50 text-sky-700 border-sky-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
};

const TARGET_STYLE: Record<ContractRequestTarget, string> = {
  OWNER: "bg-gray-100 text-gray-600 border-gray-200",
  INSURER: "bg-purple-50 text-purple-700 border-purple-200",
  ADMIN: "bg-teal-50 text-teal-700 border-teal-200",
};

const base =
  "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap";

export function StatusChip({ status }: { status: ContractRequestStatus }) {
  return (
    <span className={`${base} ${STATUS_STYLE[status]}`}>
      {REQUEST_STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityChip({
  priority,
}: {
  priority: ContractRequestPriority;
}) {
  return (
    <span className={`${base} ${PRIORITY_STYLE[priority]}`}>
      {REQUEST_PRIORITY_LABEL[priority]}
    </span>
  );
}

export function TargetChip({ target }: { target: ContractRequestTarget }) {
  return (
    <span className={`${base} ${TARGET_STYLE[target]}`}>
      {REQUEST_TARGET_LABEL[target]}
    </span>
  );
}
