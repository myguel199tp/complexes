"use client";

import { Modal } from "complexes-next-components";
import { useMaintenanceHistory } from "../../_components/useMaintenance";
import { ImSpinner9 } from "react-icons/im";
import {
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiLink,
  FiUser,
  FiMessageSquare,
} from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: string;
  conjuntoId: string;
}

export default function MaintenanceHistoryModal({
  isOpen,
  onClose,
  maintenanceId,
  conjuntoId,
}: Props) {
  const { data, isLoading } = useMaintenanceHistory(maintenanceId, conjuntoId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historial de mantenimiento">
      <div className="pt-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ImSpinner9 className="animate-spin text-2xl text-[#2E7D32]" />
          </div>
        ) : !data?.length ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No hay historial disponible para este mantenimiento.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiCalendar className="shrink-0 text-slate-400" />
                  <span>
                    Fecha de ejecución:{" "}
                    <strong>
                      {new Date(item.completedAt).toLocaleDateString("es-CO")}
                    </strong>
                  </span>
                </div>

                {item.cost != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiDollarSign className="shrink-0 text-slate-400" />
                    <span>
                      Costo:{" "}
                      <strong>
                        ${parseFloat(item.cost).toLocaleString("es-CO")}
                      </strong>
                    </span>
                  </div>
                )}

                {item.invoiceNumber && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiFileText className="shrink-0 text-slate-400" />
                    <span>
                      Factura: <strong>{item.invoiceNumber}</strong>
                    </span>
                  </div>
                )}

                {item.completedBy && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiUser className="shrink-0 text-slate-400" />
                    <span>
                      Completado por: <strong>{item.completedBy}</strong>
                    </span>
                  </div>
                )}

                {item.evidenceUrl && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiLink className="shrink-0 text-slate-400" />
                    <span>
                      Evidencia:{" "}
                      <a
                        href={item.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Ver enlace
                      </a>
                    </span>
                  </div>
                )}

                {item.completionNotes && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <FiMessageSquare className="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      Notas: <strong>{item.completionNotes}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
