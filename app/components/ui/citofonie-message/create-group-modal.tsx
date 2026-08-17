"use client";

import { Buton, InputField, Modal, Text } from "complexes-next-components";
import React, { useMemo, useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { createChatGroupService } from "./services/groupServices";
import { ChatGroup } from "./services/response/groupResponse";

interface Props {
  conjuntoId: string;
  /** Usuarios del conjunto, los mismos que alimentan la lista del chat. */
  users: EnsembleResponse[];
  onClose: () => void;
  onCreated: (group: ChatGroup) => void;
}

/**
 * Creación de un grupo de chat.
 *
 * Se puede armar de dos formas, combinables: eligiendo una torre/bloque —el
 * backend resuelve a todos sus residentes desde `UserConjuntoRelation.tower`— y
 * marcando personas a mano. El resultado es la unión de ambas.
 *
 * Solo lo abre quien puede administrar grupos; de todos modos el permiso real
 * lo aplica el backend (rol `employee` en este conjunto), esconder el botón no
 * protege nada por sí solo.
 */
export default function CreateGroupModal({
  conjuntoId,
  users,
  onClose,
  onCreated,
}: Props): JSX.Element {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tower, setTower] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Torres del conjunto, para el filtro por bloque. */
  const towers = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.tower) set.add(u.tower);
    });
    return [...set].sort();
  }, [users]);

  const candidates = useMemo(() => {
    return users
      .filter((u) => !(u.role === "owner" && u.isMainResidence === false))
      .filter((u) => Boolean(u.user?.id))
      .map((u) => ({
        id: u.user.id,
        label: u.user?.name ?? "Invitado",
        tower: u.tower ?? "",
        apartment: u.apartment ?? "",
      }));
  }, [users]);

  const visible = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    return candidates.filter((c) =>
      `${c.label} ${c.tower} ${c.apartment}`.toLowerCase().includes(query),
    );
  }, [candidates, filterText]);

  /**
   * Cuántos entran por la torre elegida. Es solo informativo: el backend
   * recalcula la lista, así que no se envían estos ids como miembros manuales.
   */
  const towerCount = useMemo(
    () => (tower ? candidates.filter((c) => c.tower === tower).length : 0),
    [candidates, tower],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("El grupo necesita un nombre");
      return;
    }
    if (!tower && selected.size === 0) {
      setError("Elige una torre o marca al menos un integrante");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const group = await createChatGroupService(conjuntoId, {
        name: name.trim(),
        description: description.trim() || undefined,
        tower: tower || undefined,
        memberIds: [...selected],
      });
      onCreated(group);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el grupo",
      );
    } finally {
      setSaving(false);
    }
  };

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
          <Text size="md" font="bold">
            Nuevo grupo
          </Text>

          <InputField
            placeholder="Nombre del grupo (ej. Torre A)"
            value={name}
            inputSize="sm"
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            placeholder="Descripción (opcional)"
            value={description}
            inputSize="sm"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Filtro por torre/bloque */}
          <div className="flex flex-col gap-1">
            <Text size="sm">Agregar a toda una torre o bloque</Text>
            <select
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              className="
                w-full
                rounded-xl
                bg-white/10
                border
                border-white/20
                px-3
                py-2
                text-sm
              "
            >
              <option value="">Sin torre — elijo a mano</option>
              {towers.map((t) => (
                <option key={t} value={t}>
                  Torre {t}
                </option>
              ))}
            </select>
            {tower && (
              <Text size="xs" className="text-cyan-400">
                Se agregarán {towerCount} residentes de la torre {tower}
              </Text>
            )}
          </div>

          {/* Selección manual, se suma a la torre */}
          <div className="flex flex-col gap-2">
            <Text size="sm">
              Integrantes adicionales{" "}
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

            <ul className="max-h-[240px] overflow-y-auto custom-scroll space-y-1">
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
                  Sin resultados
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
              Cancelar
            </Buton>
            <Buton
              onClick={handleCreate}
              disabled={saving}
              className="
                px-6
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                to-blue-600
                text-white
              "
            >
              {saving ? "Creando..." : "Crear grupo"}
            </Buton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
