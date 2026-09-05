"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Title,
  SelectField,
  InputField,
  TextAreaField,
} from "complexes-next-components";
import { MdOutlineAttachment } from "react-icons/md";

import {
  ContractRequestResponse,
  ContractRequestStatus,
  REQUEST_COST_BEARER_LABEL,
  REQUEST_STATUS_LABEL,
} from "../../services/response/contractRequestResponse";
import { contractRequestFileUrl } from "../../services/contractRequestService";
import {
  useAddRequestMessage,
  useNotifyInsurer,
  useUpdateContractRequest,
} from "./requests-mutations";
import { useContractRequestQuery } from "./requests-query";
import { PriorityChip, StatusChip, TargetChip } from "./request-chips";

interface Props {
  requestId: number;
  isOpen: boolean;
  onClose: () => void;
  /** El propietario y el personal gestionan; el arrendatario solo comenta. */
  canManage: boolean;
}

/**
 * Mismas transiciones que valida el backend.
 *
 * Se duplican a propósito en vez de pedírselas al servidor: el selector tiene
 * que mostrar solo lo que se puede hacer, y una llamada extra por cada apertura
 * del modal para traer cuatro opciones no se paga sola. Si cambian allá, hay
 * que cambiarlas aquí.
 */
const ALLOWED_TRANSITIONS: Record<
  ContractRequestStatus,
  ContractRequestStatus[]
> = {
  OPEN: ["IN_REVIEW", "IN_PROGRESS", "REJECTED"],
  IN_REVIEW: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  REJECTED: ["CLOSED"],
  CLOSED: [],
};

const COST_BEARER_OPTIONS = (
  Object.keys(
    REQUEST_COST_BEARER_LABEL,
  ) as (keyof typeof REQUEST_COST_BEARER_LABEL)[]
).map((value) => ({ value, label: REQUEST_COST_BEARER_LABEL[value] }));

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("es-CO") : "";

const formatMoney = (value: number | null) =>
  value === null ? "—" : `$${value.toLocaleString("es-CO")}`;

export default function RequestDetailModal({
  requestId,
  isOpen,
  onClose,
  canManage,
}: Props) {
  const { data: request, isInitialLoading } =
    useContractRequestQuery(requestId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitud"
      className="max-w-2xl w-full"
    >
      {isInitialLoading || !request ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-100 rounded" />
        </div>
      ) : (
        <RequestDetail
          request={request}
          canManage={canManage}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function RequestDetail({
  request,
  canManage,
  onClose,
}: {
  request: ContractRequestResponse;
  canManage: boolean;
  onClose: () => void;
}) {
  const update = useUpdateContractRequest(request.id);
  const addMessage = useAddRequestMessage(request.id);
  const notifyInsurer = useNotifyInsurer(request.id);

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string>("");
  const [resolution, setResolution] = useState("");
  const [costBearer, setCostBearer] = useState(request.costBearer);
  const [actualCost, setActualCost] = useState<string>(
    request.actualCost === null ? "" : String(request.actualCost),
  );
  const [claimNumber, setClaimNumber] = useState(
    request.insurerClaimNumber ?? "",
  );

  const transitions = ALLOWED_TRANSITIONS[request.status];

  // El arrendatario solo puede cerrar lo que ya está resuelto; el resto de
  // transiciones son del propietario.
  const tenantCanClose = !canManage && request.status === "RESOLVED";

  const needsResolution = status === "RESOLVED" || status === "REJECTED";

  const submitStatus = async () => {
    if (!status) return;

    await update.mutateAsync({
      status: status as ContractRequestStatus,
      ...(needsResolution ? { resolution } : {}),
    });

    setStatus("");
    setResolution("");
  };

  const submitManagement = async () => {
    await update.mutateAsync({
      costBearer,
      actualCost: actualCost === "" ? undefined : Number(actualCost),
      insurerClaimNumber: claimNumber || undefined,
    });
  };

  const submitComment = async () => {
    if (comment.trim().length < 2) return;

    await addMessage.mutateAsync(comment.trim());
    setComment("");
  };

  return (
    <div className="space-y-5 p-1 max-h-[75vh] overflow-y-auto">
      {/* CABECERA */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Text size="xs" className="text-gray-500 font-mono">
            {request.radicado}
          </Text>
          <StatusChip status={request.status} />
          <PriorityChip priority={request.priority} />
          <TargetChip target={request.routedTo} />
        </div>

        <Title as="h3" size="xs" font="semi">
          {request.title}
        </Title>

        <Text size="xs" className="text-gray-500">
          {request.typeLabel}
          {request.category ? ` · ${request.category}` : ""}
          {request.location ? ` · ${request.location}` : ""}
        </Text>

        <Text size="xs" className="text-gray-500">
          Reportada por {request.createdByName || "—"} el{" "}
          {formatDate(request.createdAt)}
        </Text>
      </div>

      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
        <Text size="sm" className="whitespace-pre-line text-gray-700">
          {request.description}
        </Text>
      </div>

      {/* ASEGURADORA */}
      {request.routedTo === "INSURER" && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
          <Text size="xs" className="text-purple-900">
            Radicada ante{" "}
            <strong>{request.insurerName || "la aseguradora"}</strong>
            {request.insurerPolicyNumber
              ? ` · Póliza ${request.insurerPolicyNumber}`
              : ""}
          </Text>

          <Text size="xs" className="text-purple-800">
            {request.insurerNotifiedAt
              ? `Reporte enviado el ${formatDate(request.insurerNotifiedAt)}`
              : "Todavía no se ha enviado el reporte por correo"}
          </Text>

          {request.insurerClaimNumber && (
            <Text size="xs" className="text-purple-800">
              N.º de reclamación: {request.insurerClaimNumber}
            </Text>
          )}

          {canManage && (
            <Button
              size="sm"
              rounded="md"
              onClick={() => notifyInsurer.mutate()}
              disabled={notifyInsurer.isPending}
            >
              {notifyInsurer.isPending
                ? "Enviando..."
                : request.insurerNotifiedAt
                  ? "Reenviar a la aseguradora"
                  : "Enviar a la aseguradora"}
            </Button>
          )}
        </div>
      )}

      {/* COSTOS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <Text size="xs" className="text-gray-500">
            Asume
          </Text>
          <Text size="sm" font="semi">
            {REQUEST_COST_BEARER_LABEL[request.costBearer]}
          </Text>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <Text size="xs" className="text-gray-500">
            Estimado
          </Text>
          <Text size="sm" font="semi">
            {formatMoney(request.estimatedCost)}
          </Text>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <Text size="xs" className="text-gray-500">
            Real
          </Text>
          <Text size="sm" font="semi">
            {formatMoney(request.actualCost)}
          </Text>
        </div>
      </div>

      {/* EVIDENCIAS */}
      {request.files.length > 0 && (
        <div className="space-y-2">
          <Title as="h4" size="xs" font="semi">
            Evidencias
          </Title>

          <ul className="space-y-1">
            {request.files.map((file) => (
              <li key={file.id}>
                <a
                  href={contractRequestFileUrl(file.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 underline"
                >
                  <MdOutlineAttachment size={16} />
                  {file.originalName || "Evidencia"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CAMBIO DE ESTADO */}
      {(canManage || tenantCanClose) && transitions.length > 0 && (
        <div className="p-4 border border-gray-200 rounded-xl space-y-3">
          <Title as="h4" size="xs" font="semi">
            Cambiar estado
          </Title>

          <SelectField
            defaultOption="Selecciona el nuevo estado"
            options={(tenantCanClose
              ? (["CLOSED"] as ContractRequestStatus[])
              : transitions
            ).map((value) => ({
              value,
              label: REQUEST_STATUS_LABEL[value],
            }))}
            inputSize="full"
            rounded="md"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          {needsResolution && (
            <TextAreaField
              placeholder="Explica cómo quedó la solicitud"
              helpText="Resolución"
              sizeHelp="xs"
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          )}

          <Button
            size="sm"
            colVariant="success"
            rounded="md"
            onClick={submitStatus}
            disabled={
              !status ||
              update.isPending ||
              (needsResolution && resolution.trim().length < 10)
            }
          >
            {update.isPending ? "Guardando..." : "Actualizar estado"}
          </Button>
        </div>
      )}

      {/* COSTOS Y RECLAMACIÓN */}
      {canManage && request.status !== "CLOSED" && (
        <div className="p-4 border border-gray-200 rounded-xl space-y-3">
          <Title as="h4" size="xs" font="semi">
            Costos y reclamación
          </Title>

          <SelectField
            label="Quién asume el costo"
            options={COST_BEARER_OPTIONS}
            inputSize="full"
            rounded="md"
            value={costBearer}
            onChange={(e) => setCostBearer(e.target.value as typeof costBearer)}
          />

          <InputField
            regexType="number"
            type="number"
            placeholder="Costo real"
            helpText="Costo real"
            sizeHelp="xs"
            inputSize="full"
            rounded="md"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
          />

          {request.routedTo === "INSURER" && (
            <InputField
              regexType="safeChars"
              placeholder="N.º que asignó la aseguradora"
              helpText="N.º de reclamación"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
            />
          )}

          <Button
            size="sm"
            rounded="md"
            onClick={submitManagement}
            disabled={update.isPending}
          >
            Guardar
          </Button>
        </div>
      )}

      {/* BITÁCORA */}
      <div className="space-y-3">
        <Title as="h4" size="xs" font="semi">
          Historial
        </Title>

        <ol className="space-y-3 border-l-2 border-gray-200 pl-4">
          {request.messages.map((message) => (
            <li key={message.id} className="relative">
              <span
                className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${
                  message.isSystem ? "bg-gray-400" : "bg-blue-500"
                }`}
              />

              <div className="text-xs text-gray-500">
                {message.isSystem ? "Sistema" : message.authorName || "Usuario"}
                {" · "}
                {formatDate(message.createdAt)}
              </div>

              {message.statusTo && (
                <div className="mt-1 mb-1">
                  <StatusChip status={message.statusTo} />
                </div>
              )}

              {message.message && (
                <Text size="sm" className="text-gray-700 whitespace-pre-line">
                  {message.message}
                </Text>
              )}
            </li>
          ))}
        </ol>

        {request.status !== "CLOSED" && (
          <div className="space-y-2">
            <TextAreaField
              placeholder="Escribe una respuesta"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button
              size="sm"
              rounded="md"
              onClick={submitComment}
              disabled={comment.trim().length < 2 || addMessage.isPending}
            >
              {addMessage.isPending ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" rounded="md" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
