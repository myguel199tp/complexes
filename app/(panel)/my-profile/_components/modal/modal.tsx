import { useLanguage } from "@/app/hooks/useLanguage";
import { Flag, Modal, Text } from "complexes-next-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useMyFeesQuery } from "@/app/(panel)/my-vip/_components/use-fees-query";
import {
  feeStatusLabel,
  isDebtFee,
  isInReviewFee,
  outstandingOf,
  AdminFeeResponse,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import { formatCurrency } from "@/app/_helpers/format-currency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nameUser: string;
  lastName: string;
}

const formatDueDate = (value: string): string =>
  new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export default function ModalAdmin({
  isOpen,
  onClose,
  nameUser,
  lastName,
}: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  /*
    El aviso decía "estás en mora" sin decir de cuánto: el residente tenía que
    entrar a su perfil para enterarse. Aquí se le muestra su propia deuda, que
    es la que devuelve `my-fees` para el usuario autenticado.
  */
  const { data: myFees, isLoading } = useMyFeesQuery();

  const pending: AdminFeeResponse[] = myFees?.pending ?? [];

  // Lo que sigue debiéndose de verdad: `IN_REVIEW` queda fuera porque ya
  // consignó y falta que la administración lo verifique.
  const debtFees = pending
    .filter((fee) => isDebtFee(fee.status))
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const totalDebt = debtFees.reduce((acc, fee) => acc + outstandingOf(fee), 0);

  const today = new Date();

  // Vencido a la fecha: lo que ya pasó su fecha límite hoy.
  const overdueFees = debtFees.filter(
    (fee) => new Date(fee.dueDate).getTime() < today.getTime(),
  );

  const overdueDebt = overdueFees.reduce(
    (acc, fee) => acc + outstandingOf(fee),
    0,
  );

  const inReviewDebt = pending
    .filter((fee) => isInReviewFee(fee.status))
    .reduce((acc, fee) => acc + outstandingOf(fee), 0);

  return (
    <Modal
      className="w-[730px] max-w-[95vw] max-h-[90vh] overflow-y-auto z-50"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div key={language} className="p-4">
        <Flag background="warning">
          <Text font="bold">
            Hola {nameUser} {lastName} 👋
          </Text>

          <Text tKey={t("mensajenopago")} size="md" font="bold" />

          <Text tKey={t("pagonomensaje")} size="md" className="mt-4" />

          <Text tKey={t("graciasMensaje")} size="md" className="mt-4" />

          <Text
            tKey={t("Mensajeagradecimiento")}
            size="md"
            className="mt-4"
            font="bold"
          />
        </Flag>

        {/* DEUDA A LA FECHA */}
        <div className="mt-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <Text font="bold" size="lg">
            💰 Tu deuda a la fecha ({formatDueDate(today.toISOString())})
          </Text>

          {isLoading ? (
            <Text size="sm" className="mt-2 text-gray-500">
              Calculando tu saldo...
            </Text>
          ) : debtFees.length === 0 ? (
            <Text size="sm" className="mt-2 text-green-600">
              🟢 No tienes cuotas pendientes por pagar.
            </Text>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-white p-3 text-center">
                  <Text font="bold">{formatCurrency(totalDebt)}</Text>
                  <Text size="xs">Saldo total pendiente</Text>
                </div>

                <div className="rounded-lg border bg-white p-3 text-center">
                  <Text font="bold" className="text-red-600">
                    {formatCurrency(overdueDebt)}
                  </Text>
                  <Text size="xs">
                    Vencido ({overdueFees.length} cuota
                    {overdueFees.length === 1 ? "" : "s"})
                  </Text>
                </div>

                <div className="rounded-lg border bg-white p-3 text-center">
                  <Text font="bold">{debtFees.length}</Text>
                  <Text size="xs">Cuotas por pagar</Text>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {debtFees.map((fee) => {
                  const isOverdue =
                    new Date(fee.dueDate).getTime() < today.getTime();

                  return (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between rounded-lg border bg-white p-3"
                    >
                      <div>
                        <Text font="semi">{fee.customName || fee.type}</Text>

                        <Text size="xs" className="text-gray-500">
                          Vence: {formatDueDate(fee.dueDate)} ·{" "}
                          {feeStatusLabel(fee.status)}
                        </Text>
                      </div>

                      <Text
                        font="bold"
                        className={isOverdue ? "text-red-600" : "text-gray-700"}
                      >
                        {formatCurrency(outstandingOf(fee))}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {inReviewDebt > 0 && (
                <Text size="xs" className="mt-3 text-gray-600">
                  Además tienes {formatCurrency(inReviewDebt)} en comprobantes
                  enviados que la administración todavía está verificando; no se
                  cuentan en el saldo de arriba.
                </Text>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
