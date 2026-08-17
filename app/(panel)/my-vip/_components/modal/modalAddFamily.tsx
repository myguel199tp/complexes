"use client";

import React, { useEffect, useState } from "react";
import { Button, InputField, Modal, Text } from "complexes-next-components";
import { useRegisterFamilyMutation } from "../use-register-family-mutation";
import { FamilyMemberRequest } from "../../services/request/registerFamilyRequest";
import { planLabel } from "../../services/response/familyResponse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Cupo libre según el plan; limita cuántas filas se pueden agregar. */
  available: number;
  maxAllowed: number;
  plan: string;
}

type FormMember = FamilyMemberRequest;

const emptyMember = (): FormMember => ({
  name: "",
  lastName: "",
  email: "",
  numberId: "",
  phone: "",
  indicative: "",
  bornDate: "",
  relation: "",
});

export default function ModalAddFamily({
  isOpen,
  onClose,
  available,
  maxAllowed,
  plan,
}: Props) {
  const { mutate, isPending } = useRegisterFamilyMutation();
  const [members, setMembers] = useState<FormMember[]>([emptyMember()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMembers([emptyMember()]);
      setError(null);
    }
  }, [isOpen]);

  const canAddRow = members.length < available;

  function updateMember(index: number, field: keyof FormMember, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  function addRow() {
    if (!canAddRow) return;
    setMembers((prev) => [...prev, emptyMember()]);
  }

  function removeRow(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // El correo es el identificador del familiar en el backend: si se repite,
    // la solicitud completa se rechaza, así que conviene avisarlo antes.
    const emails = members.map((m) => m.email.trim().toLowerCase());
    const duplicated = emails.find(
      (email, i) => email && emails.indexOf(email) !== i,
    );

    if (duplicated) {
      setError(`El correo ${duplicated} está repetido.`);
      return;
    }

    if (members.length > available) {
      setError(
        `Con el plan ${planLabel(plan)} solo puedes agregar ${available} familiar(es) más.`,
      );
      return;
    }

    // Los campos vacíos no se mandan: el backend hereda del propietario lo que
    // no venga (teléfono, indicativo, país y ciudad).
    const payload = members.map((m) => {
      const clean: FamilyMemberRequest = {
        name: m.name.trim(),
        lastName: m.lastName.trim(),
        email: m.email.trim().toLowerCase(),
        numberId: m.numberId.trim(),
      };

      if (m.phone?.trim()) clean.phone = m.phone.trim();
      if (m.indicative?.trim()) clean.indicative = m.indicative.trim();
      if (m.bornDate?.trim()) clean.bornDate = m.bornDate.trim();
      if (m.relation?.trim()) clean.relation = m.relation.trim();

      return clean;
    });

    mutate({ members: payload }, { onSuccess: () => onClose() });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        <div>
          <Text font="bold" size="lg">
            Agregar familiar
          </Text>

          <Text size="sm" className="text-gray-500 mt-1">
            Plan {planLabel(plan)}: hasta {maxAllowed} familiar
            {maxAllowed > 1 ? "es" : ""}. Puedes agregar {available} más.
          </Text>

          <Text size="xs" className="text-gray-400 mt-1">
            Cada familiar necesita un correo propio: ahí le llega el enlace para
            activar su cuenta y crear su contraseña.
          </Text>
        </div>

        {members.map((member, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 space-y-3 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <Text font="semi" size="sm">
                Familiar {index + 1}
              </Text>

              {members.length > 1 && (
                <Button
                  type="button"
                  colVariant="danger"
                  size="sm"
                  onClick={() => removeRow(index)}
                >
                  Quitar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Nombre"
                value={member.name}
                onChange={(e) => updateMember(index, "name", e.target.value)}
                required
              />
              <InputField
                label="Apellido"
                value={member.lastName}
                onChange={(e) =>
                  updateMember(index, "lastName", e.target.value)
                }
                required
              />
              <InputField
                label="Correo"
                type="email"
                value={member.email}
                onChange={(e) => updateMember(index, "email", e.target.value)}
                required
              />
              <InputField
                label="Documento"
                value={member.numberId}
                onChange={(e) =>
                  updateMember(index, "numberId", e.target.value)
                }
                required
              />
              <InputField
                label="Parentesco"
                placeholder="hijo, hija, cónyuge…"
                value={member.relation ?? ""}
                onChange={(e) =>
                  updateMember(index, "relation", e.target.value)
                }
              />
              <InputField
                label="Fecha de nacimiento"
                type="date"
                value={member.bornDate ?? ""}
                onChange={(e) =>
                  updateMember(index, "bornDate", e.target.value)
                }
              />
              <InputField
                label="Indicativo"
                value={member.indicative ?? ""}
                onChange={(e) =>
                  updateMember(index, "indicative", e.target.value)
                }
              />
              <InputField
                label="Teléfono"
                value={member.phone ?? ""}
                onChange={(e) => updateMember(index, "phone", e.target.value)}
              />
            </div>
          </div>
        ))}

        {canAddRow && (
          <Button
            type="button"
            colVariant="default"
            size="sm"
            onClick={addRow}
          >
            + Agregar otro familiar
          </Button>
        )}

        {error && (
          <Text size="sm" className="text-red-600">
            {error}
          </Text>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            colVariant="default"
            size="sm"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            colVariant="success"
            size="sm"
            disabled={isPending || available === 0}
          >
            {isPending ? "Guardando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
