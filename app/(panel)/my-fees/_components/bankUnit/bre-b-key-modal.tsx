"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { modal as m } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  BreBKeyType,
  ConjuntoBankAccount,
  ConjuntoBankService,
} from "../../services/bankUnitService";

/** En el orden en que conviene usarlas: primero las del conjunto. */
export const BRE_B_KEY_TYPES: { value: BreBKeyType; label: string; hint: string }[] = [
  {
    value: "negocio",
    label: "Llave de negocio",
    hint: "10 dígitos que empiezan por 00; la da el banco",
  },
  { value: "nit", label: "NIT del conjunto", hint: "sin puntos" },
  { value: "alfanumerica", label: "Alfanumérica", hint: "empieza por @" },
  { value: "correo", label: "Correo", hint: "" },
  { value: "celular", label: "Celular", hint: "10 dígitos" },
  { value: "cedula", label: "Cédula", hint: "sin puntos" },
];

const PERSONAL: BreBKeyType[] = ["correo", "celular", "cedula"];

interface Props {
  account: ConjuntoBankAccount | null;
  conjuntoId: string;
  onClose: () => void;
}

/**
 * Pone o cambia la llave Bre-B de una cuenta del conjunto. Pide el código del
 * correo, igual que registrar la cuenta: cambiar la llave es cambiar a dónde
 * llega la plata de los residentes. El Modal de la librería es siempre blanco.
 */
export default function BreBKeyModal({ account, conjuntoId, onClose }: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [keyType, setKeyType] = useState<BreBKeyType>("negocio");
  const [key, setKey] = useState("");
  const [holderName, setHolderName] = useState("");
  const [qr, setQr] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!account) return;
    setKeyType((account.breBKeyType as BreBKeyType) ?? "negocio");
    setKey(account.breBKey ?? "");
    setHolderName(account.breBHolderName ?? "");
    setQr(null);
    setOtp("");
    setCodeSent(false);
  }, [account]);

  useEffect(() => {
    if (counter <= 0) return;
    const id = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [counter]);

  const sendCode = useMutation({
    mutationFn: () => ConjuntoBankService.generateOtp(conjuntoId),
    onSuccess: () => {
      setCodeSent(true);
      setCounter(60);
    },
    onError: (e: Error) =>
      showAlert(e.message || "No se pudo enviar el código", "error"),
  });

  const save = useMutation({
    mutationFn: () =>
      ConjuntoBankService.setBreB(account!.id, conjuntoId, {
        otp,
        keyType,
        key,
        holderName,
        qr,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-bank-account", conjuntoId] });
      queryClient.invalidateQueries({
        queryKey: ["admin-fee-payment-instructions", conjuntoId],
      });
      showAlert(
        "Llave Bre-B guardada. Los residentes ya la ven en «¿Dónde pago?».",
        "success",
      );
      onClose();
    },
    onError: (e: Error) =>
      showAlert(e.message || "No se pudo guardar la llave", "error"),
  });

  if (!account) return null;

  const type = BRE_B_KEY_TYPES.find((t) => t.value === keyType);
  const isPersonal = PERSONAL.includes(keyType);
  const ready = key.trim() && holderName.trim();

  return (
    <Modal
      isOpen={!!account}
      closeOnOverlayClick={false}
      onClose={onClose}
      title={account.breBKey ? "Cambiar llave Bre-B" : "Agregar llave Bre-B"}
      className="!w-[94%] md:!w-[520px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <p className={m.text}>
          Los residentes pagan a esta llave desde la app de su banco y suben el
          comprobante. La plata llega a la cuenta{" "}
          <strong>
            {account.bankName} ···{account.accountNumber.slice(-4)}
          </strong>
          .
        </p>

        <label className="block">
          <span className={m.label}>Tipo de llave</span>
          <select
            className={m.input}
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as BreBKeyType)}
            disabled={codeSent}
          >
            {BRE_B_KEY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {isPersonal && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Esta es una llave de persona. Si es la tuya, la plata de los
            residentes llegaría a tu cuenta personal. Usa la llave de negocio o
            el NIT del conjunto si los tiene.
          </p>
        )}

        <label className="block">
          <span className={m.label}>
            Llave{type?.hint ? ` (${type.hint})` : ""}
          </span>
          <input
            className={m.input}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={codeSent}
          />
        </label>

        <label className="block">
          <span className={m.label}>
            Destinatario como lo muestra el banco al pagar
          </span>
          <input
            className={m.input}
            value={holderName}
            placeholder="Ej.: Conjunto Residencial Altos del Parque"
            onChange={(e) => setHolderName(e.target.value)}
            disabled={codeSent}
          />
          <span className={m.muted}>
            Se lo mostramos al residente para que confirme que paga al conjunto.
          </span>
        </label>

        <label className="block">
          <span className={m.label}>QR de Bre-B que te dio el banco (opcional)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm"
            onChange={(e) => setQr(e.target.files?.[0] ?? null)}
            disabled={codeSent}
          />
          {account.breBQrFile && !qr && (
            <span className={m.muted}>
              Ya tiene un QR. Si cambias la llave sin subir otro, se quita.
            </span>
          )}
        </label>

        {!codeSent ? (
          <button
            type="button"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
            disabled={!ready || sendCode.isPending}
            onClick={() => sendCode.mutate()}
          >
            {sendCode.isPending ? "Enviando…" : "Enviar código al correo"}
          </button>
        ) : (
          <div className={`${m.box} space-y-2`}>
            <label className="block">
              <span className={m.label}>Código que te llegó al correo</span>
              <input
                className={m.input}
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                disabled={otp.length < 6 || save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? "Guardando…" : "Guardar llave"}
              </button>
              <button
                type="button"
                className="text-sm text-cyan-700 underline disabled:opacity-50"
                disabled={counter > 0 || sendCode.isPending}
                onClick={() => sendCode.mutate()}
              >
                {counter > 0 ? `Reenviar en ${counter}s` : "Reenviar código"}
              </button>
              <button
                type="button"
                className="text-sm text-gray-600 underline"
                onClick={() => setCodeSent(false)}
              >
                Corregir datos
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
