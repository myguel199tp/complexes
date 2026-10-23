import { useLanguage } from "@/app/hooks/useLanguage";
import { Button, Flag, Modal, Text } from "complexes-next-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoChevronForward } from "react-icons/io5";
import { useMyFeesQuery } from "@/app/(panel)/my-vip/_components/use-fees-query";
import { ALL_OVERDUE } from "@/app/(panel)/my-vip/_components/modal/modalVipPay";
import {
  feeStatusLabel,
  isInReviewFee,
  isOverdueFee,
  outstandingOf,
  AdminFeeResponse,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import { formatCurrency } from "@/app/_helpers/format-currency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nameUser: string;
  lastName: string;
  /**
   * Lleva a subir el soporte: con el id de la cuota tocada, o `ALL_OVERDUE`
   * para un solo comprobante por todo lo vencido.
   */
  onPay: (selection: string) => void;
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
  onPay,
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

  /*
    Solo lo vencido. Al generar la cartera del año quedan todas las cuotas
    pendientes de una vez, y listarlas aquí ponía como deuda a la fecha cuotas
    que todavía no se pueden pagar. `IN_REVIEW` queda fuera porque ya consignó
    y falta que la administración lo verifique.
  */
  const overdueFees = pending
    .filter(isOverdueFee)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const overdueDebt = overdueFees.reduce(
    (acc, fee) => acc + outstandingOf(fee),
    0,
  );

  const today = new Date();

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
        <div className="mt-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4">
          <Text font="bold" size="lg">
            💰 Tu deuda a la fecha ({formatDueDate(today.toISOString())})
          </Text>

          {isLoading ? (
            <Text size="sm" className="mt-2 text-gray-500">
              Calculando tu saldo...
            </Text>
          ) : overdueFees.length === 0 ? (
            <Text size="sm" className="mt-2 text-green-600">
              🟢 No tienes cuotas vencidas.
            </Text>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-white p-3 text-center">
                  <Text font="bold" className="break-words text-red-600">
                    {formatCurrency(overdueDebt)}
                  </Text>
                  <Text size="xs">Saldo vencido</Text>
                </div>

                <div className="rounded-lg border bg-white p-3 text-center">
                  <Text font="bold">{overdueFees.length}</Text>
                  <Text size="xs">
                    Cuota{overdueFees.length === 1 ? "" : "s"} vencida
                    {overdueFees.length === 1 ? "" : "s"}
                  </Text>
                </div>
              </div>

              <Text size="xs" className="mt-3 text-gray-600">
                Toca una cuota para subir su comprobante.
              </Text>

              <div className="mt-2 space-y-2">
                {overdueFees.map((fee) => (
                  <button
                    key={fee.id}
                    type="button"
                    onClick={() => onPay(fee.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
                  >
                    {/* `min-w-0` deja encoger el nombre y `shrink-0` sostiene
                        el valor: sin eso, en el teléfono el monto se salía de
                        la tarjeta. El `Text` trae `text-xl` por defecto. */}
                    <div className="min-w-0 flex-1">
                      <Text
                        size="sm"
                        font="semi"
                        className="break-words md:!text-base"
                      >
                        {fee.customName || fee.type}
                      </Text>

                      <Text size="xs" className="text-gray-500">
                        Vence: {formatDueDate(fee.dueDate)} ·{" "}
                        {feeStatusLabel(fee.status)}
                      </Text>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Text
                        size="sm"
                        font="bold"
                        className="whitespace-nowrap text-red-600 md:!text-base"
                      >
                        {formatCurrency(outstandingOf(fee))}
                      </Text>
                      <IoChevronForward className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>

              {/*
                Un solo comprobante por todo: quien se pone al día consigna una
                vez, no cuota por cuota.
              */}
              <Button
                type="button"
                colVariant="success"
                size="sm"
                className="mt-4 w-full"
                onClick={() => onPay(ALL_OVERDUE)}
              >
                Subir soporte del saldo total ({formatCurrency(overdueDebt)})
              </Button>

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
