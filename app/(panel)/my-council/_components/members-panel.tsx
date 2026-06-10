"use client";
import { useState } from "react";
import { Button, InputField } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilMemberResponse } from "../services/response/councilResponse";
import { CouncilRole } from "../services/request/councilRequest";
import { useCouncilMembersQuery } from "./use-council-query";
import { useMyUserCouncilQuery } from "./query-user-council";
import { useRolesMutation } from "./use-roles-mutation";
import { useAddMemberMutation } from "./use-add-member-mutation";
import { useRemoveMemberMutation } from "./use-remove-member-mutation";

const ASSIGNABLE_ROLES: { value: CouncilRole; label: string }[] = [
  { value: "president", label: "Presidente" },
  { value: "vice_president", label: "Vicepresidente" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Tesorero" },
  ...Array.from({ length: 19 }, (_, i) => ({
    value: `vocal_${i + 1}` as CouncilRole,
    label: `Vocal ${i + 1}`,
  })),
];

const ROLE_BADGE: Record<string, string> = {
  president: "bg-yellow-100 text-yellow-800 border-yellow-200",
  vice_president: "bg-orange-100 text-orange-800 border-orange-200",
  secretary: "bg-purple-100 text-pruple-800 border-purple-200",
  treasurer: "bg-green-100 text-green-800 border-green-200",
  ...Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [
      `vocal_${i + 1}`,
      "bg-purple-100 text-purple-800 border-purple-200",
    ]),
  ),
};

const ROLE_LABELS: Record<string, string> = {
  president: "Presidente",
  vice_president: "Vicepresidente",
  treasurer: "Tesorero",
  ...Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [`vocal_${i + 1}`, `Vocal ${i + 1}`]),
  ),
};

export default function MembersPanel() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { data: members = [], isLoading } = useCouncilMembersQuery();
  const { data: allUsers = [] } = useMyUserCouncilQuery();

  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));
  const rolesMutation = useRolesMutation();
  const addMutation = useAddMemberMutation();
  const removeMutation = useRemoveMemberMutation();

  const [pendingRoles, setPendingRoles] = useState<Record<string, CouncilRole>>(
    {},
  );
  const [newUserId, setNewUserId] = useState("");

  const getRole = (member: CouncilMemberResponse) =>
    pendingRoles[member.userId] !== undefined
      ? pendingRoles[member.userId]
      : member.role;

  const handleRoleChange = (userId: string, role: string) => {
    setPendingRoles((prev) => ({
      ...prev,
      [userId]: role as CouncilRole,
    }));
  };

  const handleSaveRoles = () => {
    const changes = members
      .filter((m) => pendingRoles[m.userId] !== undefined)
      .map((m) => ({
        userId: m.userId,
        role: pendingRoles[m.userId] as CouncilRole,
        conjuntoId: String(conjuntoId ?? ""),
      }))
      .filter((r) => r.role);

    if (changes.length === 0) return;
    rolesMutation.mutate(changes, { onSuccess: () => setPendingRoles({}) });
  };

  const handleAdd = () => {
    if (!newUserId.trim()) return;
    addMutation.mutate(
      { userId: newUserId.trim(), conjuntoId: String(conjuntoId ?? "") },
      { onSuccess: () => setNewUserId("") },
    );
  };

  const handleRemove = (userId: string) => {
    removeMutation.mutate({ userId, conjuntoId: String(conjuntoId ?? "") });
  };

  const hasPending = Object.keys(pendingRoles).length > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {members.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No hay miembros en el consejo.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const role = getRole(member);
              return (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                        {userMap[member.userId]?.name ??
                          member.userId.slice(0, 8) + "…"}
                      </p>
                      {userMap[member.userId]?.apartment && (
                        <p className="text-xs text-gray-400">
                          Apto. {userMap[member.userId].apartment}
                        </p>
                      )}
                    </div>
                    {role ? (
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full border text-gray-400 bg-gray-50">
                        Sin cargo
                      </span>
                    )}
                  </div>

                  <select
                    value={pendingRoles[member.userId] ?? role ?? ""}
                    onChange={(e) =>
                      handleRoleChange(member.userId, e.target.value)
                    }
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      — Asignar cargo —
                    </option>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemove(member.userId)}
                    disabled={removeMutation.isPending}
                    className="w-full text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg py-1.5 transition-colors"
                  >
                    Eliminar miembro
                  </button>
                </div>
              );
            })}
          </div>

          {hasPending && (
            <Button
              onClick={handleSaveRoles}
              disabled={rolesMutation.isPending}
              colVariant="success"
              rounded="md"
              size="sm"
            >
              {rolesMutation.isPending ? "Guardando..." : "Guardar cargos"}
            </Button>
          )}
        </>
      )}

      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700">Agregar miembro</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField
              placeholder="ID del usuario"
              inputSize="sm"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            colVariant="success"
            onClick={handleAdd}
            disabled={addMutation.isPending || !newUserId.trim()}
          >
            {addMutation.isPending ? "..." : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
