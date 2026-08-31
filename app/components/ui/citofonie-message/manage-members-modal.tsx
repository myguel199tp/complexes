"use client";

import { Buton, InputField, Modal, Text } from "complexes-next-components";
import React, { useMemo, useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { HiUserGroup } from "react-icons/hi2";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import {
  addChatGroupMembersService,
  removeChatGroupMemberService,
  syncChatGroupTowerService,
} from "./services/groupServices";
import { ChatGroup } from "./services/response/groupResponse";

interface Props {
  conjuntoId: string;
  group: ChatGroup;
  /** Usuarios del conjunto, los mismos que alimentan la lista del chat. */
  users: EnsembleResponse[];
  onClose: () => void;
  onUpdated: (group: ChatGroup) => void;
}

/**
 * Administración de integrantes de un grupo ya creado.
 *
 * La membresía queda materializada en `chat_group_members` al crear el grupo:
 * quien llegue después al conjunto —o a la torre— no entra solo. Este modal
 * cubre las tres operaciones que el backend ya exponía y que no tenían
 * pantalla: agregar personas del conjunto, sacarlas, y volver a sincronizar
 * con la torre de origen cuando el grupo se armó por bloque.
 *
 * Los candidatos son los usuarios del conjunto que aún no están en el grupo;
 * quien ya es miembro se lista aparte para poder quitarlo. El permiso real lo
 * aplica el backend (rol `employee` en este conjunto), aquí solo se oculta la
 * entrada a quien no puede usarla.
 */
export default function ManageMembersModal({
  conjuntoId,
  group,
  users,
  onClose,
  onUpdated,
}: Props): JSX.Element {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const members = useMemo(() => group.members ?? [], [group.members]);

  const memberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  /** Usuarios del conjunto que todavía no pertenecen al grupo. */
  const candidates = useMemo(() => {
    return users
      .filter((u) => !(u.role === "owner" && u.isMainResidence === false))
      .filter((u) => Boolean(u.user?.id))
      .filter((u) => !memberIds.has(u.user.id))
      .map((u) => ({
        id: u.user.id,
        label: u.user?.name ?? "Invitado",
        tower: u.tower ?? "",
        apartment: u.apartment ?? "",
      }));
  }, [users, memberIds]);

  const visible = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    return candidates.filter((c) =>
      `${c.label} ${c.tower} ${c.apartment}`.toLowerCase().includes(query),
    );
  }, [candidates, filterText]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Envuelve las tres acciones: mismo manejo de error y de estado de guardado. */
  const run = async (action: () => Promise<ChatGroup>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await action();
      onUpdated(updated);
      setSelected(new Set());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el grupo",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (selected.size === 0) {
      setError("Marca al menos una persona para agregar");
      return;
    }
    return run(() =>
      addChatGroupMembersService(group.id, conjuntoId, [...selected]),
    );
  };

  const handleRemove = (userId: string) =>
    run(() => removeChatGroupMemberService(group.id, conjuntoId, userId));

  const handleSyncTower = () =>
    run(() => syncChatGroupTowerService(group.id, conjuntoId));

  return (
    <div className="fixed inset-0 z-[9999999]">
      <Modal
        isOpen
        onClose={onClose}
        className="
          w-full
          max-w-[720px]
          p-4
          bg-white/10
          backdrop-blur-2xl
          border
          border-white/20
          rounded-3xl
        "
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HiUserGroup size={18} className="text-cyan-400" />
            <Text size="md" font="bold" colVariant="on">
              Integrantes de {group.name}
            </Text>
          </div>

          {/* Miembros actuales: quitar es inmediato, no hay guardado diferido */}
          <div className="flex flex-col gap-2">
            <Text size="sm" colVariant="on">
              En el grupo ({members.length})
            </Text>
            <ul className="max-h-[160px] overflow-y-auto custom-scroll space-y-1">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-3
                    py-2
                    rounded-xl
                    bg-white/5
                    border
                    border-white/10
                  "
                >
                  <Text size="sm">
                    {m.user?.name ?? "Usuario"}
                    {m.isAdmin && (
                      <span className="ml-2 text-xs text-cyan-400">admin</span>
                    )}
                  </Text>
                  {/* A quien creó el grupo el backend no deja sacarlo */}
                  {m.userId !== group.createdById && (
                    <button
                      type="button"
                      title="Quitar del grupo"
                      disabled={saving}
                      onClick={() => handleRemove(m.userId)}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <IoMdClose size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Un grupo armado por torre se re-sincroniza con los que llegaron después */}
          {group.tower && (
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <Text size="xs" className="opacity-80">
                Grupo armado con la torre {group.tower}
              </Text>
              <Buton
                onClick={handleSyncTower}
                disabled={saving}
                className="px-4 rounded-2xl bg-white/10 border border-white/20"
              >
                Sincronizar torre
              </Buton>
            </div>
          )}

          {/* Agregar personas del conjunto */}
          <div className="flex flex-col gap-2">
            <Text size="sm" colVariant="on">
              Agregar del conjunto{" "}
              {selected.size > 0 && `(${selected.size} marcados)`}
            </Text>

            <div className="relative">
              <IoSearchCircle
                size={20}
                className="absolute left-3 top-2.5 text-cyan-400"
              />
              <InputField
                placeholder="Buscar por nombre o apartamento"
                value={filterText}
                inputSize="sm"
                className="pl-10 bg-white/10 border border-white/20 rounded-xl"
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <ul className="max-h-[220px] overflow-y-auto custom-scroll space-y-1">
              {visible.map((c) => (
                <li key={c.id}>
                  <label
                    className="
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2
                      rounded-xl
                      cursor-pointer
                      bg-white/5
                      border
                      border-white/10
                      hover:bg-white/10
                    "
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                    <div className="flex flex-col">
                      <Text size="sm">{c.label}</Text>
                      {(c.tower || c.apartment) && (
                        <Text size="xs" className="opacity-70">
                          {c.tower}-{c.apartment}
                        </Text>
                      )}
                    </div>
                  </label>
                </li>
              ))}
              {visible.length === 0 && (
                <Text size="xs" className="opacity-70">
                  {candidates.length === 0
                    ? "Todos los usuarios del conjunto ya están en el grupo"
                    : "Sin resultados"}
                </Text>
              )}
            </ul>
          </div>

          {error && (
            <Text size="sm" className="text-red-400">
              {error}
            </Text>
          )}

          <div className="flex justify-end gap-2">
            <Buton onClick={onClose} className="px-5 rounded-2xl bg-gray-500">
              Cerrar
            </Buton>
            <Buton
              onClick={handleAdd}
              disabled={saving || selected.size === 0}
              className="
                px-6
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                to-blue-600
                text-white
                disabled:opacity-50
              "
            >
              {saving ? "Guardando..." : "Agregar al grupo"}
            </Buton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
