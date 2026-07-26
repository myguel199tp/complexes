"use client";

import React from "react";
import {
  BOOKING_STATUS_LABELS,
  BookingStatus,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "@/app/(panel)/my-advertisement/services/response/marketplaceResponse";

/** Un color por familia de estado: en curso, cerrado bien, cerrado mal. */
const TONE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  no_show: "bg-gray-100 text-gray-600 border-gray-200",
};

export function StatusBadge({
  status,
}: {
  status: OrderStatus | BookingStatus;
}) {
  const label =
    ORDER_STATUS_LABELS[status as OrderStatus] ??
    BOOKING_STATUS_LABELS[status as BookingStatus] ??
    status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        TONE[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}
