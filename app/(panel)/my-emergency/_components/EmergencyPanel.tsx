"use client";

import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { Button } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EmergencyStatus } from "../services/response/emergencyResponse";
import { useActiveEmergency } from "./useEmergency";
import ActivateEmergencyForm from "./ActivateEmergencyForm";
import EmergencyDashboardCards from "./EmergencyDashboardCards";
import EmergencyReportsTable from "./EmergencyReportsTable";
import EmergencyTimeline from "./EmergencyTimeline";
import EmergencyResolveModal from "./EmergencyResolveModal";
import BrigadeManager from "./BrigadeManager";

export default function EmergencyPanel() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { data: emergency, isLoading } = useActiveEmergency(conjuntoId);
  const [showResolve, setShowResolve] = useState(false);

  if (isLoading && emergency === undefined) {
    return (
      <div className="flex justify-center py-10">
        <ImSpinner9 className="animate-spin text-2xl text-cyan-300" />
      </div>
    );
  }

  const isActive = emergency && emergency.status === EmergencyStatus.ACTIVE;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-white">Emergencias</h1>

      {!isActive && (
        <div className="mt-4 space-y-6">
          <ActivateEmergencyForm />
          <BrigadeManager />
        </div>
      )}

      {isActive && emergency && (
        <div className="mt-4">
          <div className="flex items-center justify-between rounded-2xl border border-red-300 bg-red-50 p-4">
            <div>
              <p className="font-semibold text-red-700">
                Emergencia activa: {emergency.customTypeLabel || emergency.type}
              </p>
              <p className="text-sm text-red-600">
                Iniciada el {new Date(emergency.startedAt).toLocaleString()}
              </p>
            </div>
            <Button colVariant="success" onClick={() => setShowResolve(true)}>
              Resolver
            </Button>
          </div>

          <EmergencyDashboardCards emergencyId={emergency.id} conjuntoId={conjuntoId} />
          <EmergencyReportsTable emergencyId={emergency.id} conjuntoId={conjuntoId} />
          <EmergencyTimeline emergencyId={emergency.id} conjuntoId={conjuntoId} />
        </div>
      )}

      {showResolve && emergency && (
        <EmergencyResolveModal
          emergencyId={emergency.id}
          conjuntoId={conjuntoId}
          onClose={() => setShowResolve(false)}
        />
      )}
    </div>
  );
}
